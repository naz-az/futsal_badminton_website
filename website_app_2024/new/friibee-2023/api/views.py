from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .serializers import ProjectSerializer, UserSerializer, TagSerializer, ProfileSerializer, FavoriteSerializer, MessageSerializer, ThreadSerializer, NotificationSerializer, AttendanceSerializer
from projects.models import Project, Review, Tag, Vote, Image, Attendance
from projects.utils import searchProjects

from users.models import Profile, Favorite, Msg, Thread,ThreadParticipants, Notif
from users.utils import searchProfiles


@api_view(['GET'])
def getRoutes(request):

    routes = [
        {'GET': '/api/projects'},
        {'GET': '/api/projects/id'},
        {'POST': '/api/projects/id/vote'},

        {'POST': '/api/users/token'},
        {'POST': '/api/users/token/refresh'},
    ]
    return Response(routes)


@api_view(['GET'])
def getProjects(request, profile_id=None):
    # If profile_id is provided, filter projects based on that profile.
    if profile_id:
        projects = Project.objects.filter(owner__id=profile_id)
    else:
        # If profile_id isn't provided, use the searchProjects function.
        search_query = request.GET.get('search_query', '')
        sort_by = request.GET.get('sort_by', '')
        projects, _ = searchProjects(request, sort_by)  # Modify searchProjects to handle sorting

    # If tag_id is provided, filter projects based on the tag.
    tag_id = request.GET.get('tag_id', None)
    if tag_id:
        projects = projects.filter(tags__id=tag_id)

    serializer = ProjectSerializer(projects, many=True)
    return Response(serializer.data)


from django.shortcuts import get_object_or_404

@api_view(['GET'])
def getProject(request, pk):
    project = get_object_or_404(Project, id=pk)
    serializer = ProjectSerializer(project, many=False)
    return Response({'project': serializer.data})

from rest_framework.decorators import api_view
from rest_framework.response import Response
from projects.models import Com, Like
from.serializers import ComSerializer

@api_view(['GET'])
def get_comments(request, project_id):
    comments = Com.objects.filter(project_id=project_id, parent=None)
    serializer = ComSerializer(comments, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
def post_comment(request, project_id):
    print(f"Received project_id: {project_id}")
    user = request.user.profile
    project = get_object_or_404(Project, id=project_id)
    content = request.data.get('content')
    parent_id = request.data.get('parent_id')
    print(f"Received parent_id: {parent_id}")

    if parent_id:
        parent = get_object_or_404(Com, id=parent_id)
        comment = Com.objects.create(user=user, project=project, content=content, parent=parent)

        # Ensure a user does not get a notification for replying to their own comment
        if parent.user != user:

            if parent.user.notify_new_replied_comment:

                # Create a notification for the user who is replied to
                Notif.objects.create(
                    user=parent.user, 
                    replied_comment=parent, 
                    comment=comment, 
                    notification_type='REPLY'
                )
                print(f"Notification created for {parent.user}")


    else:
        comment = Com.objects.create(user=user, project=project, content=content)
        
        if project.owner != user:  # Avoid notifying for self-comments
            if project.owner.notify_new_comment_on_project:

                notif=Notif.objects.create(user=project.owner, comment=comment, notification_type='COMMENT')
                print(f"Notification created: {notif}")

    serializer = ComSerializer(comment)
    return Response(serializer.data)

from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

@api_view(['DELETE'])
def delete_comment(request, comment_id):
    comment = get_object_or_404(Com, id=comment_id)

    # Check if the request user is the same as the comment user
    if request.user.profile != comment.user:
        return Response({"detail": "You do not have permission to delete this comment."},
                        status=status.HTTP_403_FORBIDDEN)

    comment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

from django.shortcuts import get_object_or_404
# Other imports ...
# views.py

# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addLike(request, comment_id):
    user = request.user.profile  # Assuming 'profile' is the related name for the user's Profile
    comment = Com.objects.get(id=comment_id)

    like, created = Like.objects.get_or_create(user=user, comment=comment)
    
    if created:
        return Response({'detail': 'Comment liked!'})
    return Response({'detail': 'Comment already liked!'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def removeLike(request, comment_id):
    user = request.user.profile  # Adjusted to use Profile
    like = Like.objects.filter(user=user, comment__id=comment_id)
    
    if like.exists():
        like.delete()
        return Response({'detail': 'Like removed!'})
    return Response({'detail': 'Like not found!'}, status=status.HTTP_404_NOT_FOUND)

# views.py

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def isLiked(request, comment_id):
    user = request.user.profile
    is_liked = Like.objects.filter(user=user, comment__id=comment_id).exists()
    like_count = Like.objects.filter(comment__id=comment_id).count()  # Counting the likes
    return Response({'isLiked': is_liked, 'likeCount': like_count})

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import F


from django.db.models import Q

@api_view(['GET'])
def getProfiles(request):
    search_query = request.GET.get('search_query', '')
    
    profiles, _ = searchProfiles(request)
    
    serializer = ProfileSerializer(profiles, many=True)
    return Response(serializer.data)

@api_view(['GET'])
# @permission_classes([IsAuthenticated])  # Optional: only authenticated users can view the profile details
def getProfile(request, profile_id):
    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ProfileSerializer(profile)
    return Response(serializer.data)



# views.py
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def add_vote(request, project_id, vote_type):
#     profile = request.user.profile  # Assuming you have a related name `profile` in your User model
#     project = Project.objects.get(id=project_id)

#     # Delete any existing vote
#     Vote.objects.filter(user=profile, project=project).delete()

#     # Create a new vote
#     if vote_type in [Vote.UP, Vote.DOWN]:
#         Vote.objects.create(user=profile, project=project, vote_type=vote_type)
#         return Response({'detail': f'{vote_type} vote recorded!'})
#     else:
#         return Response({'detail': 'Invalid vote type!'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_vote(request, project_id, vote_type):
    profile = request.user.profile  # Assuming you have a related name `profile` in your User model
    project = Project.objects.get(id=project_id)


    # Check for existing vote
    existing_vote = Vote.objects.filter(user=profile, project=project).first()

    # If there's an existing vote and the vote type is different, handle notification
    if existing_vote and existing_vote.vote_type != vote_type:
        if existing_vote.vote_type == Vote.UP:
            # Delete the upvote notification if the vote is changed from up to down
            notifications_count, _ = Notif.objects.filter(
                user=project.owner,
                notification_type='VOTE',
                project=project,
                voting_user=profile
            ).delete()
            print(f"{notifications_count} upvote notification(s) deleted for user {profile.username} on project {project.title}.")

        # Delete the existing vote
        existing_vote.delete()

    # Create a new vote
    new_vote, created = Vote.objects.update_or_create(
        user=profile, project=project, defaults={'vote_type': vote_type}
    )

    # Create a notification for an upvote
    if created and vote_type == Vote.UP and profile != project.owner:
        if project.owner.notify_new_upvote_on_project:

            new_notification = Notif.objects.create(
                user=project.owner,
                notification_type='VOTE',
                project=project,
                voting_user=profile  # Save the voting user in the notification
            )
            print(f"Notification created: {new_notification}")  # Print statement after notification creation

            # Log the username and profile image URL to the console
            username = profile.username
            profile_image_url = profile.profile_image
            print(f"User {username} with profile image {profile_image_url} voted for project {project.title}")

    return Response({'detail': f'{vote_type} vote recorded!'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_vote(request, project_id):
    profile = request.user.profile
    vote = Vote.objects.filter(user=profile, project__id=project_id).first()

    # Calculate the net vote count
    up_votes = Vote.objects.filter(project__id=project_id, vote_type=Vote.UP).count()
    down_votes = Vote.objects.filter(project__id=project_id, vote_type=Vote.DOWN).count()
    net_vote_count = up_votes - down_votes

    if vote:
        return Response({'voteType': vote.vote_type, 'voteCount': net_vote_count})
    return Response({'voteType': None, 'voteCount': net_vote_count})


# @api_view(['DELETE'])
# @permission_classes([IsAuthenticated])
# def remove_vote(request, project_id, vote_type):
#     profile = request.user.profile
#     project = Project.objects.get(id=project_id)

#     Vote.objects.filter(user=profile, project=project, vote_type=vote_type).delete()
#     return Response({'detail': f'{vote_type} vote removed!'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_vote(request, project_id, vote_type):
    profile = request.user.profile
    project = Project.objects.get(id=project_id)

    # First, remove the vote
    Vote.objects.filter(user=profile, project=project, vote_type=vote_type).delete()

    if profile != project.owner:

        # Then, remove the notification associated with the vote if it exists
        notifications_count, _ = Notif.objects.filter(
            user=project.owner,
            notification_type='VOTE',
            project=project,
            voting_user=profile
        ).delete()

        if notifications_count > 0:
            print(f"{notifications_count} vote notification(s) deleted for user {profile.username} on project {project.title}.")

    return Response({'detail': f'{vote_type} vote and notification removed!'}, status=status.HTTP_204_NO_CONTENT)


# @api_view(['POST'])
# def set_vote(request, project_id):
#     user = request.user
#     project = Project.objects.get(id=project_id)
#     vote_value = request.data.get("vote")  # Expect -1, 0, or 1

#     # Check for a valid vote value
#     if vote_value not in [-1, 0, 1]:
#         return Response({"error": "Invalid vote value"}, status=400)

#     # Get or create the vote
#     vote, created = Vote.objects.get_or_create(user=user, project=project)
#     vote.vote = vote_value
#     vote.save()

#     # Update the project's vote counts
#     project.upvotes = Vote.objects.filter(project=project, vote=1).count()
#     project.downvotes = Vote.objects.filter(project=project, vote=-1).count()
#     project.save()
#     # Return the response with vote counts
#     return Response({
#         "message": "Vote recorded",
#         "upvotes": project.upvotes,
#         "downvotes": project.downvotes,
#         "userVote": vote.vote
#     })

# from rest_framework.decorators import api_view
# from rest_framework.response import Response

# @api_view(['GET'])
# def get_vote(request, project_id):
#     user = request.user
#     project = Project.objects.get(id=project_id)

#     try:
#         vote = Vote.objects.get(user=user, project=project)
#         userVote = vote.vote
#     except Vote.DoesNotExist:
#         userVote = 0

#     upvotes = project.upvotes
#     downvotes = project.downvotes

#     return Response({
#         "userVote": userVote,
#         "upvotes": upvotes,
#         "downvotes": downvotes
#     })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def projectVote(request, pk):
    project = Project.objects.get(id=pk)
    user = request.user.profile
    data = request.data

    review, created = Review.objects.get_or_create(
        owner=user,
        project=project,
    )

    review.value = data['value']
    review.save()
    project.getVoteCount

    serializer = ProjectSerializer(project, many=False)
    return Response(serializer.data)


from rest_framework.decorators import api_view
from rest_framework.response import Response
from projects.models import Tag
from .serializers import TagSerializer

@api_view(['POST'])
def addTag(request):
    name = request.data.get('name')
    if name:
        tag, created = Tag.objects.get_or_create(name=name)
        if created:
            return Response(TagSerializer(tag).data)
        else:
            return Response({'message': 'Tag already exists'}, status=400)
    return Response({'message': 'No name provided'}, status=400)



@api_view(['GET'])
def getTags(request):
    tags = Tag.objects.all()
    serializer = TagSerializer(tags, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
def removeTag(request):
    tagId = request.data['tag']
    projectId = request.data['project']

    project = Project.objects.get(id=projectId)
    tag = Tag.objects.get(id=tagId)

    project.tags.remove(tag)

    return Response('Tag was deleted!')



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def followTag(request, tag_id):
    profile = request.user.profile
    tag = get_object_or_404(Tag, id=tag_id)
    profile.followed_tags.add(tag)
    return Response({'message': 'Tag followed'}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unfollowTag(request, tag_id):
    profile = request.user.profile
    tag = get_object_or_404(Tag, id=tag_id)
    profile.followed_tags.remove(tag)
    return Response({'message': 'Tag unfollowed'}, status=200)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getFollowedTags(request):
    """
    Get all the tags followed by the logged-in user's profile.
    """
    # Assuming 'request.user' is the logged-in user and 'profile' is a related Profile object
    user = request.user
    if not user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=403)

    profile = user.profile

    # Get followed tags for this profile
    followed_tags = profile.followed_tags.all()

    # Serialize the data
    serializer = TagSerializer(followed_tags, many=True)
    
    return Response(serializer.data)


from random import shuffle

@api_view(['GET'])
def getRandomProjects(request):
    projects = list(Project.objects.all())
    shuffle(projects)
    serializer = ProjectSerializer(projects, many=True)
    return Response(serializer.data)



# views.py
from django.db.models import F  # <-- Add this import at the top of your file
from django.db.models import Count, Case, When, IntegerField

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def getFavorites(request):
#     user = request.user
#     sort_by = request.GET.get('sort_by', None)
    
#     # Initially, it fetches all the favorites of a user
#     favorites = Favorite.objects.filter(user=user)

#     # Add sorting based on the query parameter
#     if sort_by == "newest":
#         favorites = favorites.order_by('-created')
#     elif sort_by == "upvotes":
#         favorites = favorites.annotate(
#             upvotes=Count(Case(When(project__vote__vote_type=Vote.UP, then=1), 
#             output_field=IntegerField()))
#         ).order_by('-upvotes')

#     serializer = FavoriteSerializer(favorites, many=True)
#     return Response(serializer.data)


from django.db.models import Case, When, Count, IntegerField
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import FavoriteSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getFavorites(request):
    user = request.user
    sort_by = request.GET.get('sort_by', 'created')  # This is your default sort field.
    order = request.GET.get('order', 'desc')
    order_prefix = '' if order == 'asc' else '-'

    favorites = Favorite.objects.filter(user=user)

    if sort_by in ["newest", "created"]:  # Using 'created' since that is the actual field name.
        favorites = favorites.order_by(f'{order_prefix}created')
    elif sort_by == "upvotes":
        favorites = favorites.annotate(
            upvotes=Count('project__vote', filter=Q(project__vote__vote_type=Vote.UP))  # This assumes your related name for votes is 'vote'.
        ).order_by(f'{order_prefix}upvotes')
    elif sort_by == "price":
        favorites = favorites.order_by(f'{order_prefix}project__price')


    serializer = FavoriteSerializer(favorites, many=True)
    return Response(serializer.data)


# ... Rest of your views


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addFavorite(request, project_id):
    user = request.user
    project = Project.objects.get(id=project_id)

    favorite, created = Favorite.objects.get_or_create(user=user, project=project)
    
    if created:
        return Response({'detail': 'Project added to favorites!'})
    return Response({'detail': 'Project already in favorites!'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def removeFavorite(request, project_id):
    user = request.user
    favorite = Favorite.objects.filter(user=user, project__id=project_id)
    
    if favorite.exists():
        favorite.delete()
        return Response({'detail': 'Project removed from favorites!'})
    return Response({'detail': 'Project not in favorites!'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def isFavorite(request, project_id):
    user = request.user
    is_favorited = Favorite.objects.filter(user=user, project__id=project_id).exists()
    return Response({'isFavorited': is_favorited})




from django.contrib.auth.decorators import login_required


from rest_framework_simplejwt.tokens import TokenError, AccessToken



from rest_framework_simplejwt.tokens import TokenError, AccessToken

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserAccount(request):
    # Print the Authorization Header (useful for debugging)
    auth_header = request.headers.get('Authorization')
    print(f"Authorization Header: {auth_header}")  

    # Check if the token can be decoded
    token_string = auth_header.split()[1] if auth_header else None  # Assuming format is "Bearer <token>"
    try:
        token = AccessToken(token_string)
        print(token.payload)  # <-- Add this line here
    except TokenError:
        print("Token is invalid!")
        return Response({"detail": "Token is invalid!"}, status=401)

    # Check if user is authenticated
    if request.user.is_authenticated:
        print(f"User {request.user.username} is authenticated.")
    else:
        print("User is not authenticated!")
        return Response({"detail": "User is not authenticated!"}, status=401)

    # Fetch user data
    profile = request.user.profile
    skills = profile.skill_set.all()  # remove if not required
    projects = profile.project_set.all()

    profile_serializer = ProfileSerializer(profile, many=False)
    projects_serializer = ProjectSerializer(projects, many=True)

    data = {
        "profile": profile_serializer.data,
        "projects": projects_serializer.data,
    }

    return Response(data)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def editAccount(request):
    # Remove empty strings from lists for certain fields
    mutable_data = request.data.copy()  # Make a mutable copy of the QueryDict
    for field in ['blocked_users', 'followed_tags', 'followers']:
        if mutable_data.get(field) == ['']:  # Check if field is a list containing an empty string
            mutable_data.setlist(field, [])  # Set the field to an empty list
    
    print("Adjusted Data:", mutable_data)  # Log the adjusted data
    
    profile = request.user.profile
    serializer = ProfileSerializer(profile, data=mutable_data, partial=True) # Ensure partial update
    if serializer.is_valid():
        serializer.save()
        return Response({"success": True, "success data": serializer.data})

    print("Serializer Errors:", serializer.errors)  # Log errors if serializer is not valid
    return Response(serializer.errors, status=400)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def editAccount(request):
#     print("Incoming Data:", request.data)  # Log incoming data

#     profile = request.user.profile
#     serializer = ProfileSerializer(profile, data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response({"success": True, "success data": serializer.data})


#     print("Serializer Errors:", serializer.errors)  # Log errors if serializer is not valid
#     return Response(serializer.errors, status=400)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET', 'POST', 'DELETE', 'PUT'])
def projectComments(request, pk, comment_id=None):
    # Handling GET request for fetching comments
    if request.method == 'GET':
        project = Project.objects.get(id=pk)
        comments = Comment.objects.filter(project=project)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    # Handling POST request for adding comments
    elif request.method == 'POST':
        # Check if the user is authenticated before proceeding
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        parent_id = request.data.get('parent')
        parent_comment = None
        if parent_id:
            parent_comment = Comment.objects.get(id=parent_id)

        user = request.user.profile
        project = Project.objects.get(id=pk)
        content = request.data['content']
        comment = Comment.objects.create(user=user, project=project, content=content, parent=parent_comment)
        serializer = CommentSerializer(comment, many=False)
        return Response(serializer.data)

    # Handling DELETE request for deleting comments
    elif request.method == 'DELETE':
        # Check if the user is authenticated before proceeding
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        # Try to get the comment to delete
        try:
            comment = Comment.objects.get(id=comment_id, user=request.user.profile)
        except Comment.DoesNotExist:
            return Response({"detail": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the authenticated user is the owner of the comment
        if comment.user != request.user.profile:
            return Response({"detail": "You don't have permission to delete this comment."}, status=status.HTTP_403_FORBIDDEN)

        # Recursively delete the comment and its replies
        comment.delete() # This will cascade and delete all child comments due to the model's ForeignKey setting
        return Response({"detail": "Comment and its replies deleted."}, status=status.HTTP_200_OK)

    # Handling PUT request for liking comments
    elif request.method == 'PUT':
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            return Response({"detail": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Toggle like
        if request.user.profile in comment.likes.all():
            comment.likes.remove(request.user.profile)
        else:
            comment.likes.add(request.user.profile)
        comment.save()
        serializer = CommentSerializer(comment, many=False)
        return Response(serializer.data)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upvote_project(request, pk):
    project = Project.objects.get(id=pk)
    user_profile = request.user.profile

    rating, created = Rating.objects.get_or_create(user=user_profile, project=project, defaults={'value': 1})

    if not created:
        if rating.value == 1:
            rating.delete()
            project.upvotes -= 1
        else:
            rating.value = 1
            project.upvotes += 1
            project.downvotes -= 1
            rating.save()
    else:
        project.upvotes += 1

    project.save()

    return Response({
    "message": "Upvoted successfully",
    "upvotes": project.upvotes,
    "downvotes": project.downvotes,
    "user_vote": rating.value
})



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def downvote_project(request, pk):
    project = Project.objects.get(id=pk)
    user_profile = request.user.profile

    rating, created = Rating.objects.get_or_create(user=user_profile, project=project, defaults={'value': -1})

    if not created:
        if rating.value == -1:
            rating.delete()
            project.downvotes -= 1
        else:
            rating.value = -1
            project.downvotes += 1
            project.upvotes -= 1
            rating.save()
    else:
        project.downvotes += 1

    project.save()

    return Response({
    "message": "Upvoted successfully",
    "upvotes": project.upvotes,
    "downvotes": project.downvotes,
    "user_vote": rating.value
})



# @api_view(['POST'])
# def followProfile(request, profile_id):
#     try:
#         profile_to_follow = Profile.objects.get(id=profile_id)
#     except Profile.DoesNotExist:
#         return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
    
#     profile_to_follow.followers.add(request.user)
#     profile_to_follow.save()
    

#     return Response({"detail": "Followed successfully"}, status=status.HTTP_200_OK)



@api_view(['POST'])
def followProfile(request, profile_id):
    try:
        print(f"Request to follow profile ID: {profile_id}")
        profile_to_follow = Profile.objects.get(id=profile_id)
        follower_profile = Profile.objects.get(user=request.user)
        
        # Debugging the add operation
        print(f"Adding follower: {follower_profile.user.username} to {profile_to_follow.username}")
        profile_to_follow.followers.add(follower_profile.user)
        profile_to_follow.save()
        
        if profile_to_follow.notify_new_followers:
            notif = Notif.objects.create(user=profile_to_follow, follower=follower_profile, notification_type='FOLLOWER')
            print(f"Notification created: {notif}")
            
        return Response({"detail": "Followed successfully"}, status=status.HTTP_200_OK)
    except Profile.DoesNotExist:
        print(f"Profile {profile_id} not found for following.")
        return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)


# @api_view(['POST'])
# def unfollowProfile(request, profile_id):
#     try:
#         profile_to_unfollow = Profile.objects.get(id=profile_id)
#     except Profile.DoesNotExist:
#         return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
    
#     profile_to_unfollow.followers.remove(request.user)
#     profile_to_unfollow.save()

#     return Response({"detail": "Unfollowed successfully"}, status=status.HTTP_200_OK)


@api_view(['POST'])
def unfollowProfile(request, profile_id):
    try:
        profile_to_unfollow = Profile.objects.get(id=profile_id)
        follower_profile = Profile.objects.get(user=request.user)

        # Remove the follow relationship
        profile_to_unfollow.followers.remove(request.user)
        profile_to_unfollow.save()

        # Check if notifications for new followers were enabled at the time of follow
        if profile_to_unfollow.notify_new_followers:
            # Delete the notification and print confirmation
            deleted_notifications = Notif.objects.filter(
                user=profile_to_unfollow,
                follower=follower_profile,
                notification_type='FOLLOWER'
            ).delete()

            # The delete() method returns a tuple of (number_of_rows_deleted, dictionary_with_details)
            if deleted_notifications[0] > 0:
                print(f"Notification removed: {follower_profile.user.username} unfollowed {profile_to_unfollow.username}")
            else:
                print(f"No notifications found to remove for {follower_profile.user.username} unfollowing {profile_to_unfollow.username}")
        else:
            print(f"Notifications were not enabled for {profile_to_unfollow.username}")

        return Response({"detail": "Unfollowed successfully"}, status=status.HTTP_200_OK)
    except Profile.DoesNotExist:
        return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def is_following(request, profile_id):
    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    is_following = profile.followers.filter(id=request.user.id).exists()
    return Response({"is_following": is_following}, status=status.HTTP_200_OK)


from django.shortcuts import get_object_or_404

@api_view(['GET'])
def get_following_profiles(request):
    user = request.user
    following_profiles = user.following.all()
    serializer = ProfileSerializer(following_profiles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_followers(request):
    user = request.user
    profile = get_object_or_404(Profile, user=user)
    
    # Get Profiles of the followers
    followers_profiles = Profile.objects.filter(user__in=profile.followers.all())

    serializer = ProfileSerializer(followers_profiles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

from django.shortcuts import get_object_or_404

@api_view(['POST'])
def remove_follower(request, profile_id):
    user = request.user
    try:
        # Profile to remove from user's followers
        follower_profile = get_object_or_404(Profile, id=profile_id)

        # Remove follower_profile from user's followers
        user.profile.followers.remove(follower_profile.user)

        # Remove user from follower_profile's following
        follower_profile.followers.remove(user)

        return Response({"detail": "Follower removed successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response

from rest_framework import status
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])  # Allow unauthenticated access
def get_user_following(request, profile_id):
    try:
        profile = Profile.objects.get(id=profile_id)
        # Assuming 'following' is a reverse relation from other profiles to this user's profile.
        following_profiles = Profile.objects.filter(followers__in=[profile.user])
        serializer = ProfileSerializer(following_profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Profile.DoesNotExist:
        return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

# @api_view(['GET'])
# def get_user_followers(request, profile_id):
#     profile = get_object_or_404(Profile, id=profile_id)
#     # Get the user instances that are following this profile
#     followers_users = profile.followers.all()
#     # Get the profile instances related to those users
#     followers_profiles = Profile.objects.filter(user__in=followers_users)
#     serializer = ProfileSerializer(followers_profiles, many=True)
#     return Response(serializer.data, status=status.HTTP_200_OK)

from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([AllowAny])  # Allow unauthenticated access
def get_user_followers(request, profile_id):
    profile = get_object_or_404(Profile, id=profile_id)
    followers_users = profile.followers.all()
    followers_profiles = Profile.objects.filter(user__in=followers_users)
    serializer = ProfileSerializer(followers_profiles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# views.py
from rest_framework import generics
from .serializers import MsgSerializer

class MsgCreateView(generics.CreateAPIView):
    queryset = Msg.objects.all()
    serializer_class = MsgSerializer

class MsgListView(generics.ListAPIView):
    queryset = Msg.objects.all()
    serializer_class = MsgSerializer



import logging

logger = logging.getLogger(__name__)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_message(request, pk=None):
#     if pk:
#         recipient = Profile.objects.get(id=pk)
#     else:
#         recipient = None

#     try:
#         sender = request.user.profile
#     except:
#         sender = None

#     if request.method == 'POST':
#         serializer = MessageSerializer(data=request.data)
#         if serializer.is_valid():
#             if recipient:
#                 # Ensure a unique thread between two users
#                 thread, created = Thread.objects.get_or_create(
#                     participants__in=[sender, recipient]
#                 )
#                 if created:
#                     thread.participants.add(sender, recipient)
#             else:
#                 # Handling for no recipient (optional)
#                 thread = Thread.objects.create()
#                 thread.participants.add(sender)

#             message = serializer.save(sender=sender, recipient=recipient, thread=thread)

#             if sender:
#                 message.name = sender.name
#                 message.email = sender.email
#                 message.save()

#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_inbox_messages(request):
#     user_profile = request.user.profile
#     messages = Msg.objects.filter(recipient=user_profile)
#     serializer = MessageSerializer(messages, many=True)
#     return Response(serializer.data)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_sent_messages(request):
#     user_profile = request.user.profile
#     messages = Msg.objects.filter(sender=user_profile)
#     serializer = MessageSerializer(messages, many=True)
#     return Response(serializer.data)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_message(request, message_id):
#     try:
#         message = Msg.objects.get(id=message_id)
#         serializer = MessageSerializer(message)
#         return Response(serializer.data)
#     except Msg.DoesNotExist:
#         return Response({"detail": "Message not found"}, status=status.HTTP_404_NOT_FOUND)
    
# @api_view(['DELETE'])
# @permission_classes([IsAuthenticated])
# def delete_message(request, message_id):
#     try:
#         message = Msg.objects.get(id=message_id)
        
#         # Check if the user requesting the delete is either the sender or recipient
#         if request.user.profile != message.sender and request.user.profile != message.recipient:
#             return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        
#         message.delete()
#         return Response({"detail": "Message deleted successfully."}, status=status.HTTP_200_OK)
#     except Msg.DoesNotExist:
#         return Response({"detail": "Message not found."}, status=status.HTTP_404_NOT_FOUND)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def mark_message_as_read(request, pk):
#     try:
#         message = Msg.objects.get(id=pk)
#         if message.recipient == request.user.profile:  # Make sure the user is the recipient
#             message.is_read = True
#             message.save()
#             return Response({"status": "Message marked as read"}, status=status.HTTP_200_OK)
#         else:
#             return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
#     except Msg.DoesNotExist:
#         return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)



# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_message_thread(request, thread_id):
#     try:
#         thread = Thread.objects.get(id=thread_id)
#         messages = Msg.objects.filter(thread=thread)
#         serializer = MessageSerializer(messages, many=True)
#         return Response(serializer.data)
#     except Thread.DoesNotExist:
#         return Response({"detail": "Thread not found"}, status=status.HTTP_404_NOT_FOUND)



# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_reply(request, message_id):
#     parent_message = Msg.objects.get(id=message_id)
#     recipient = parent_message.sender  # A reply would typically be to the sender of the parent message

#     sender = request.user.profile

#     if request.method == 'POST':
#         serializer = MessageSerializer(data=request.data)
#         if serializer.is_valid():
#             message = serializer.save(sender=sender, recipient=recipient, parent_msg=parent_message)
#             message.name = sender.name
#             message.email = sender.email
#             message.save()

#             print("Reply from:", sender.name)
#             print("Reply to:", recipient.name)
#             print("Subject:", message.subject)
#             print("Message:", message.body)
            
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
        
#         else:
#             logger.error(f"Serializer errors: {serializer.errors}")
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from users.models import Msg
# from .serializers import MsgSerializer

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_messages(request, thread_id):
#     try:
#         # Fetch all messages, including replies
#         msgs = Msg.objects.filter(thread=thread_id).order_by('created')
#         serializer = MsgSerializer(msgs, many=True)
#         return Response(serializer.data)
#     except Thread.DoesNotExist:
#         return Response({"error": "Thread not found"}, status=status.HTTP_404_NOT_FOUND)



# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def send_message(request):
#     recipient_id = request.data['recipientId']
#     sender = request.user.profile
#     recipient = Profile.objects.get(id=recipient_id)

#     # Look for an existing thread between the two users
#     thread = Thread.objects.filter(
#         participants=sender
#     ).filter(
#         participants=recipient
#     ).first()

#     # Create a new thread if none exists
#     if not thread:
#         thread = Thread.objects.create()
#         thread.participants.set([sender, recipient])
#         thread.save()

#     request.data['sender'] = sender.id
#     serializer = MsgSerializer(data=request.data)

#     if serializer.is_valid():
#         msg = serializer.save()  # Save the Msg instance
#         msg.sender = sender  # Set the sender
#         msg.recipient = recipient  # Set the recipient
#         msg.thread = thread  # Assign the thread
#         msg.save()  # Now save the Msg instance with all details set

#         response_data = MsgSerializer(msg).data
#         return Response(response_data, status=status.HTTP_201_CREATED)


#     else:
        
#         print(serializer.errors)  # Add this line to log errors
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def reply_to_message(request, msg_id):
#     try:
#         parent_msg = Msg.objects.get(id=msg_id)
#         sender = request.user.profile
#         recipient = parent_msg.sender if sender != parent_msg.sender else parent_msg.recipient

#         # Prepare data for creating a new message
#         data = request.data.copy()  # Make a mutable copy
#         data['body'] = request.data['body']
#         data['thread'] = parent_msg.thread.id
#         data['parent_msg'] = parent_msg.id

#         # Create message without sender and recipient
#         serializer = MsgSerializer(data=data)
#         if serializer.is_valid():
#             new_msg = serializer.save()  # Save message instance
#             print("New replied message created:", new_msg)  # Log new message details
#             serialized_data = MsgSerializer(new_msg).data
#             print("Serialized Data:", serialized_data)
#             new_msg.sender = sender  # Set the sender
#             new_msg.recipient = recipient  # Set the recipient
#             new_msg.save()  # Save again with sender and recipient
#             return Response(MsgSerializer(new_msg).data, status=status.HTTP_201_CREATED)
#         else:
#             print("Serializer errors:", serializer.errors)  # Log serializer errors
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     except Msg.DoesNotExist:
#         print("Message does not exist")  # Log if the parent message doesn't exist
#         return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)




# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.models import Profile, Messg, Thrd
from .serializers import MessageSerializer
import logging

logger = logging.getLogger(__name__)



# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def send_message(request):
#     data = request.data
#     logger.debug(f"Received data for sending message: {data}")

#     sender_profile = request.user.profile
#     logger.debug(f"Sender Profile: {sender_profile}")

#     try:
#         recipient_profile = Profile.objects.get(id=data['recipientId'])
#         logger.debug(f"Recipient Profile: {recipient_profile}")
#     except Profile.DoesNotExist:
#         logger.error(f"Recipient profile with id {data['recipientId']} not found")
#         return Response({"detail": "Recipient profile not found"}, status=404)

#     thread_id = data.get('threadId')
#     parent_id = data.get('parentId', None)
#     logger.debug(f"Thread ID: {thread_id}, Parent ID: {parent_id}")

#     if not thread_id:
#         thread = Thrd.objects.create()
#         thread.participants.add(sender_profile, recipient_profile)
#         logger.debug(f"New thread created: {thread}")
#     else:
#         try:
#             thread = Thrd.objects.get(id=thread_id, participants=sender_profile)
#             logger.debug(f"Found thread: {thread}")
#         except Thrd.DoesNotExist:
#             logger.error(f"Thread with id {thread_id} not found")
#             return Response({"detail": "Thread not found"}, status=404)

#     parent_message = None
#     if parent_id:
#         try:
#             parent_message = Messg.objects.get(id=parent_id)
#             logger.debug(f"Parent Message: {parent_message}")
#         except Messg.DoesNotExist:
#             logger.error(f"Parent message with id {parent_id} not found")
#             return Response({"detail": "Parent message not found"}, status=404)

#     message = Messg.objects.create(
#         sender=sender_profile,
#         recipient=recipient_profile,
#         body=data['body'],
#         thread=thread,
#         parent=parent_message
#     )
#     logger.debug(f"Message created: {message}")

#     serialized_data = MessageSerializer(message).data
#     logger.debug(f"Serialized message data: {serialized_data}")

#     return Response({
#         "message": serialized_data,
#         "thread": {"id": str(thread.id)}
#     })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    data = request.data
    logger.debug(f"Received data for sending message: {data}")

    sender_profile = request.user.profile
    logger.debug(f"Sender Profile: {sender_profile}")

    try:
        recipient_profile = Profile.objects.get(id=data['recipientId'])
        logger.debug(f"Recipient Profile: {recipient_profile}")
    except Profile.DoesNotExist:
        logger.error(f"Recipient profile with id {data['recipientId']} not found")
        return Response({"detail": "Recipient profile not found"}, status=404)

    thread_id = data.get('threadId')
    parent_id = data.get('parentId', None)
    logger.debug(f"Thread ID: {thread_id}, Parent ID: {parent_id}")

    if not thread_id:
        thread = Thrd.objects.create()
        thread.participants.add(sender_profile, recipient_profile)
        logger.debug(f"New thread created: {thread}")
    else:
        try:
            thread = Thrd.objects.get(id=thread_id, participants=sender_profile)
            logger.debug(f"Found thread: {thread}")
        except Thrd.DoesNotExist:
            logger.error(f"Thread with id {thread_id} not found")
            return Response({"detail": "Thread not found"}, status=404)

    parent_message = None
    if parent_id:
        try:
            parent_message = Messg.objects.get(id=parent_id)
            logger.debug(f"Parent Message: {parent_message}")
        except Messg.DoesNotExist:
            logger.error(f"Parent message with id {parent_id} not found")
            return Response({"detail": "Parent message not found"}, status=404)

    message = Messg.objects.create(
        sender=sender_profile,
        recipient=recipient_profile,
        body=data['body'],
        thread=thread,
        # parent=parent_message,
        parent=parent_message if parent_id else None,

        # viewed=False  # Set viewed to False by default

    )

    print(f"Message created: {message}")

    # Inside your send_message function after the message is created

    if parent_message and sender_profile == parent_message.sender:
        notification_recipient_profile = parent_message.recipient
    else:
        notification_recipient_profile = thread.participants.exclude(id=sender_profile.id).first()

    if notification_recipient_profile.notify_new_messages:  # Ensure this is the correct attribute name

        # Create a notification for the correct recipient
        notif = Notif.objects.create(
            user=notification_recipient_profile,
            notification_type='MESSAGE',
            message=message  # Reference to the newly created message
        )

        print(f"Notification created: {notif}")

    serialized_data = MessageSerializer(message).data
    logger.debug(f"Serialized message data: {serialized_data}")

    return Response({
        "message": serialized_data,
        "thread": {"id": str(thread.id)}
    }, status=status.HTTP_201_CREATED)



# Existing imports...

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_thread(request, thread_id):
    try:
        thread = Thrd.objects.get(id=thread_id, participants=request.user.profile)
        serializer = ThreadSerializer(thread, context={'request': request})
        logger.debug(f"Serialized thread data: {serializer.data}")

        # Log the serialized data before returning
        logger.info(f"Backend Response for Thread: {serializer.data}")

        return Response(serializer.data)
    except Thrd.DoesNotExist:
        logger.error(f"Thread with id {thread_id} not found")
        return Response({'detail': 'Thread not found'}, status=404)



logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_threads(request):
    user_profile = request.user.profile
    threads = Thrd.objects.filter(participants=user_profile)
    serializer = ThreadSerializer(threads, many=True, context={'request': request})

    logger.debug(f"Serialized threads data: {serializer.data}")

    return Response(serializer.data)


from rest_framework import status

# @api_view(['GET', 'DELETE'])
# @permission_classes([IsAuthenticated])
# def thread_detail(request, thread_id):
#     if request.method == 'GET':
#         try:
#             thread = Thrd.objects.get(id=thread_id, participants=request.user.profile)
#             # Mark messages as viewed
#             for message in thread.messages.filter(recipient=request.user.profile, viewed=False):
#                 logger.debug(f"Message {message.id} is currently not viewed. Now marking as viewed.")
#                 message.viewed = True
#                 message.save()
#             serializer = ThreadSerializer(thread)
#             return Response(serializer.data)
#         except Thrd.DoesNotExist:
#             return Response({'detail': 'Thread not found'}, status=status.HTTP_404_NOT_FOUND)

#     elif request.method == 'DELETE':
#         try:
#             thread = Thrd.objects.get(id=thread_id, participants=request.user.profile)
#             thread.delete()
#             return Response(status=status.HTTP_204_NO_CONTENT)
#         except Thrd.DoesNotExist:
#             return Response({'detail': 'Thread not found'}, status=status.HTTP_404_NOT_FOUND)
        

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# from .models import Thrd
# from .serializers import ThreadSerializer

# @api_view(['GET', 'DELETE'])
# @permission_classes([IsAuthenticated])
# def thread_detail(request, thread_id):
#     try:
#         thread = Thrd.objects.get(id=thread_id, participants=request.user.profile)
        
#         if request.method == 'GET':
#             # Mark messages as viewed by the current user (recipient)
#             for message in thread.messages.filter(recipient=request.user.profile, viewed=False):
#                 message.viewed = True
#                 message.save()

#             serializer = ThreadSerializer(thread)
#             return Response(serializer.data)
        
#         elif request.method == 'DELETE':
#             thread.delete()
#             return Response(status=status.HTTP_204_NO_CONTENT)
            
#     except Thrd.DoesNotExist:
#         return Response({'detail': 'Thread not found'}, status=status.HTTP_404_NOT_FOUND)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import ThreadSerializer


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def thread_detail(request, thread_id):
    if request.method == 'GET':
        try:
            thread = Thrd.objects.get(id=thread_id, participants=request.user.profile)
            # Mark messages as viewed
            for message in thread.messages.filter(viewed=False):
                if message.sender != request.user.profile:
                    message.mark_viewed(request.user.profile)

                
                message.save()
            serializer = ThreadSerializer(thread, context={'request': request})
            return Response(serializer.data)
        except Thrd.DoesNotExist:
            return Response({'detail': 'Thread not found'}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'DELETE':
        try:
            thread = Thrd.objects.get(id=thread_id, participants=request.user.profile)
            thread.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Thrd.DoesNotExist:
            return Response({'detail': 'Thread not found'}, status=status.HTTP_404_NOT_FOUND)
        




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_message_as_viewed(request, message_id):
    try:
        message = Messg.objects.get(id=message_id, recipient=request.user.profile)

        if not message.viewed:
            message.viewed = True
            message.save()

        return Response({'status': 'success'}, status=200)
    except Messg.DoesNotExist:
        return Response({'error': 'Message not found'}, status=404)





from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import ProjectSerializer
from projects.forms import ProjectForm

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import ProjectSerializer


from uuid import UUID

def is_valid_uuid(uuid_to_test):
    try:
        UUID(str(uuid_to_test), version=4)
    except ValueError:
        return False
    return True

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import re

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createProject(request):

    print("Received FILES: ", request.FILES)
    print("Received DATA: ", request.data)


    user = request.user
    profile = user.profile
    data = request.data

    project = Project(owner=profile)
    serializer = ProjectSerializer(project, data=data, partial=True)  # Use partial=True
    
    print("Serializer Data:", serializer.initial_data)

    if serializer.is_valid():
        saved_project = serializer.save()

        # Handle tags if they are present in the request
        tags_data = request.data.getlist('tags')
        for tag_id in tags_data:
            if is_valid_uuid(tag_id):
                try:
                    tag = Tag.objects.get(id=tag_id)
                    saved_project.tags.add(tag)
                except Tag.DoesNotExist:
                    pass  # Handle the exception as needed
            else:
                print(f"Invalid UUID: {tag_id}")  # Log invalid UUID

        for key in request.FILES:
            print("Processing file with key: ", key)
            if key.startswith('additional_images_'):
                Image.objects.create(project=saved_project, image=request.FILES[key])
            else:
                print("Unexpected key: ", key)
        
        # Return the updated project data including the associated tags
        return Response(ProjectSerializer(saved_project).data)
    else:
        print("Serializer errors:", serializer.errors)  # Log serializer errors
        return Response(serializer.errors, status=400)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateProject(request, project_id):
    print("Updating project with ID:", project_id)
    
    try:
        project = Project.objects.get(id=project_id, owner=request.user.profile)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=404)

    print("Current featured image:", project.featured_image)
    print("Current additional images:", project.project_images.all())
    print("Current tags for the project:", project.tags.all())

    print("Received request data:", request.data)
    print("Files in the request:", request.FILES)

    # Create a copy of request.data to modify
    data = request.data.copy()

    # Process each file key in request.FILES
    for file_key in request.FILES:
        if file_key.startswith('additional_image_'):
            # Skip additional images here, will handle them separately
            continue
        else:
            data[file_key] = request.FILES[file_key]

    serializer = ProjectSerializer(project, data=data, partial=True)

    if serializer.is_valid():
        print("Serializer is valid, processing...")

        # Always clear existing tags before adding new ones
        project.tags.clear()
            # Handling tags
        tag_ids = request.data.getlist('tags')  # Changed from get to getlist
        print("Received tag IDs:", tag_ids)  # This will now print all the tag IDs

        for tag_id in tag_ids:
            if is_valid_uuid(tag_id):  # Use the is_valid_uuid function you have in createProject
                try:
                    tag = Tag.objects.get(id=tag_id)
                    project.tags.add(tag)
                except Tag.DoesNotExist:
                    pass  # Optionally handle the case where the tag is not found
            else:
                print(f"Invalid UUID: {tag_id}")  # Log invalid UUID

        if 'featured_image' in request.FILES:
            if project.featured_image and hasattr(project.featured_image, 'url'):
                print("Deleting old featured image...")
                project.featured_image.delete(save=False)  # save=False to prevent premature save
                print("Old featured image deleted.")
            project.featured_image = request.FILES['featured_image']

        # Handling additional images
        current_additional_images = list(project.project_images.all())  # Assuming this gives you the current images
        for i in range(3):
            file_key = f'additional_image_{i}'
            if file_key in request.FILES:
                if i < len(current_additional_images):
                    old_image = current_additional_images[i]
                    old_image.delete()  # Deleting the old image

                # Create new Image object for the project
                Image.objects.create(project=project, image=request.FILES[file_key])

        # Save the serializer to commit other changes
        serializer.save()
        project.save()  # Save changes to the project itself
        return Response(ProjectSerializer(project).data)
    else:
        print("Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=400)



# @api_view(['PUT'])
# @permission_classes([IsAuthenticated])
# def updateProject(request, project_id):
#     print("Updating project with ID:", project_id)
    
#     try:
#         project = Project.objects.get(id=project_id, owner=request.user.profile)
#     except Project.DoesNotExist:
#         return Response({'error': 'Project not found'}, status=404)

#     print("Current featured image:", project.featured_image)
#     print("Current additional image:", project.project_images.all())

#     print("Received request data:", request.data)
#     print("Files in the request:", request.FILES)

#     serializer = ProjectSerializer(project, data=request.data, partial=True)

#     if serializer.is_valid():
#         print("Serializer is valid, processing...")
        
#         if 'featured_image' in request.FILES:
#             if project.featured_image and hasattr(project.featured_image, 'url'):
#                 print("Deleting old featured image...")
#                 project.featured_image.delete(save=False)  # save=False to prevent premature save
#                 print("Old featured image deleted.")
#             project.featured_image = request.FILES['featured_image']

#         # Handling additional images
#         current_additional_images = list(project.project_images.all()) # Assuming this gives you the current images
#         for i in range(3):
#             file_key = f'additional_image_{i}'
#             if file_key in request.FILES:
#                 if i < len(current_additional_images):
#                     old_image = current_additional_images[i]
#                     old_image.delete()  # Deleting the old image

#                 # Create new Image object for the project
#                 Image.objects.create(project=project, image=request.FILES[file_key])

#         project.save()  # Save changes
#         return Response(ProjectSerializer(project).data)
#     else:
#         print("Serializer Errors:", serializer.errors)
#         return Response(serializer.errors, status=400)


# @api_view(['PUT'])
# @permission_classes([IsAuthenticated])
# def updateProject(request, project_id):
#     print("Updating project with ID:", project_id)
    
#     try:
#         project = Project.objects.get(id=project_id, owner=request.user.profile)
#     except Project.DoesNotExist:
#         return Response({'error': 'Project not found'}, status=404)

#     print("Current featured image:", project.featured_image)
#     print("Current additional images:", project.project_images.all())
#     print("Received request data:", request.data)
#     print("Files in the request:", request.FILES)

#     # Create a copy of request.data to modify
#     data = request.data.copy()

#     # Process each file key in request.FILES
#     for file_key in request.FILES:
#         if file_key.startswith('additional_image_'):
#             # Skip additional images here, will handle them separately
#             continue
#         else:
#             data[file_key] = request.FILES[file_key]

#     serializer = ProjectSerializer(project, data=data, partial=True)

#     if serializer.is_valid():
#         print("Serializer is valid, processing...")

#         if 'featured_image' in request.FILES:
#             if project.featured_image and hasattr(project.featured_image, 'url'):
#                 print("Deleting old featured image...")
#                 project.featured_image.delete(save=False)  # save=False to prevent premature save
#                 print("Old featured image deleted.")
#             project.featured_image = request.FILES['featured_image']

#         # Handling additional images
#         current_additional_images = list(project.project_images.all())  # Assuming this gives you the current images
#         for i in range(3):
#             file_key = f'additional_image_{i}'
#             if file_key in request.FILES:
#                 if i < len(current_additional_images):
#                     old_image = current_additional_images[i]
#                     old_image.delete()  # Deleting the old image

#                 # Create new Image object for the project
#                 Image.objects.create(project=project, image=request.FILES[file_key])

#         # Save the serializer to commit other changes
#         serializer.save()
#         project.save()  # Save changes to the project itself
#         return Response(ProjectSerializer(project).data)
#     else:
#         print("Serializer Errors:", serializer.errors)
#         return Response(serializer.errors, status=400)



# @api_view(['PUT'])
# @permission_classes([IsAuthenticated])
# def updateProject(request, project_id):

#     print("Updating project with ID:", project_id)
#     saved_project = Project.objects.get(id=project_id)
#     print("Current featured image:", saved_project.featured_image)

#     print("Received request data:", request.data)
#     print("Files in the request:", request.FILES)
#     user = request.user
#     profile = user.profile

#     # Conditional deletion
#     if saved_project.featured_image and hasattr(saved_project.featured_image, 'url'):
#         print("Deleting old featured image...")
#         saved_project.featured_image.delete()
#         print("Old featured image deleted.")

#     try:
#         project = Project.objects.get(id=project_id, owner=profile)
#     except Project.DoesNotExist:
#         return Response({'error': 'Project not found'}, status=404)

#     serializer = ProjectSerializer(project, data=request.data, partial=True)

#     if serializer.is_valid():
#         print("Serializer is valid, processing...")

#         saved_project = serializer.save()
#         # Handle tags as in createProject view
# # Handle image updates
#         if 'featured_image' in request.FILES:
#             # Delete the old featured_image if it exists
#             if saved_project.featured_image:
#                 saved_project.featured_image.delete()
#             saved_project.featured_image = request.FILES['featured_image']

#         for i in range(3):
#             file_key = f'additional_image_{i}'
#             if file_key in request.FILES:
#                 # Assuming a Project can have multiple Image objects
#                 # Delete the old image at this index if it exists
#                 old_image = Image.objects.filter(project=saved_project, position=i).first()
#                 if old_image:
#                     old_image.delete()
#                 # Create new Image object
#                 Image.objects.create(project=saved_project, image=request.FILES[file_key], position=i)

#         saved_project.save()
#         return Response(ProjectSerializer(saved_project).data)
#     else:
#         print("Serializer Errors:", serializer.errors)  # Add this line
#         return Response(serializer.errors, status=400)



from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteProject(request, pk):
    user = request.user
    project = get_object_or_404(Project, id=pk)

    # Check if the user is the owner of the project
    if project.owner.user != user:
        return Response({'message': 'You do not have permission to delete this project'}, status=403)

    project.delete()
    return Response({'message': 'Project deleted successfully'})



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def block_user(request, user_id):
    try:
        user_to_block = Profile.objects.get(id=user_id)
        request.user.profile.blocked_users.add(user_to_block)
        return Response({'message': 'User blocked successfully'}, status=status.HTTP_200_OK)
    except Profile.DoesNotExist:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unblock_user(request, user_id):
    try:
        user_to_unblock = Profile.objects.get(id=user_id)
        request.user.profile.blocked_users.remove(user_to_unblock)
        return Response({'message': 'User unblocked successfully'}, status=status.HTTP_200_OK)
    except Profile.DoesNotExist:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_blocked_users(request):
    blocked_users = request.user.profile.blocked_users.all()
    serializer = ProfileSerializer(blocked_users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_user_blocked(request, profile_id):
    try:
        profile = Profile.objects.get(id=profile_id)
        if profile.has_blocked(request.user.profile.id):
            return Response({'is_blocked': True}, status=status.HTTP_200_OK)
        return Response({'is_blocked': False}, status=status.HTTP_200_OK)
    except Profile.DoesNotExist:
        return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_blocking_users(request):
    blocking_users = Profile.objects.filter(blocked_users=request.user.profile)
    serializer = ProfileSerializer(blocking_users, many=True)
    return Response(serializer.data)












from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
def register_user(request):
    try:
        print("Request received with data:", request.data)

        data = request.data

        print("Creating user...")
        user = User.objects.create(
            username=data['username'],
            email=data['email'],
            password=make_password(data['password'])  # Hashes the password
        )
        print(f"User {user.username} created with ID: {user.id}")

        user.save()
        print(f"User {user.username} saved to database.")

        print("Generating JWT token...")
        refresh = RefreshToken.for_user(user)  # Generate JWT token
        print("JWT token generated.")

        response_data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        print("Sending response with tokens:", response_data)

        return Response(response_data, status=status.HTTP_201_CREATED)

    except Exception as e:
        print("An error occurred:", str(e))
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)






# In get_notifications view to check retrieval
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    
    # Get all notifications for the user, not just unread
    notifications = Notif.objects.filter(user=request.user.profile)
    # print(f"Retrieved notifications for user {request.user.username}: {notifications}")
    # Serialize including the 'read' status
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


# In clear_all_notifications to check the update operation
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clear_all_notifications(request):
    notifications = Notif.objects.filter(user=request.user.profile, read=False)
    print(f"Clearing notifications for user {request.user.username}")
    notifications.update(read=True)
    return Response(status=status.HTTP_204_NO_CONTENT)


from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request):
    # Assume that the request contains a notification ID
    notif_id = request.data.get('id')
    if not notif_id:
        return Response({'detail': 'Notification ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Retrieve the notification and mark it as read
        notification = Notif.objects.get(pk=notif_id, user=request.user.profile)
        notification.read = True
        notification.save()
        return Response({'detail': 'Notification marked as read'}, status=status.HTTP_200_OK)
    except Notif.DoesNotExist:
        return Response({'detail': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_as_read(request):
    Notif.objects.filter(user=request.user.profile, read=False).update(read=True)
    return Response(status=status.HTTP_204_NO_CONTENT)


# @api_view(['POST'])
# def clear_notification(request, notification_id):
#     try:
#         notification = Notif.objects.get(id=notification_id, user=request.user)
#         notification.read = True
#         notification.save()
#         return Response(status=status.HTTP_204_NO_CONTENT)
#     except Notif.DoesNotExist:
#         return Response({"detail": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clear_message_notifications(request):
    message_notifications = Notif.objects.filter(user=request.user.profile, read=False, notification_type='MESSAGE')
    print(f"Clearing message notifications for user {request.user.username}")
    message_notifications.update(read=True)
    return Response(status=status.HTTP_204_NO_CONTENT)




# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def update_notification_settings(request):
#     """
#     Update notification settings for the current user's profile.
#     """
#     user_profile = request.user.profile
#     data = request.data
    
#     # A helper function to update the notification settings based on the request data
#     def update_setting(setting_name, default=True):
#         value = data.get(setting_name, default)
#         if isinstance(value, str):
#             setattr(user_profile, setting_name, value.lower() == 'true')
#         else:
#             setattr(user_profile, setting_name, bool(value))
#         print(f"New setting for '{setting_name}':", getattr(user_profile, setting_name))
    
#     # Update each notification setting
#     update_setting('notify_new_followers')
#     update_setting('notify_new_messages')
#     update_setting('notify_new_comment_on_project')  # New setting
#     update_setting('notify_new_replied_comment')     # New setting
#     update_setting('notify_new_upvote_on_project')

#     user_profile.save()

#     return Response({"detail": "Notification settings updated"}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notification_settings(request):
    """
    Retrieve notification settings for the current user's profile.
    """
    try:
        profile = request.user.profile
        # Assuming there is a serializer for the Profile which includes the notification settings
        serializer = ProfileSerializer(profile, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Profile.DoesNotExist:
        return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)


from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_notify_new_followers(request):
    return update_notification_setting(request, 'notify_new_followers')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_notify_new_messages(request):
    return update_notification_setting(request, 'notify_new_messages')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_notify_new_comment_on_project(request):
    return update_notification_setting(request, 'notify_new_comment_on_project')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_notify_new_replied_comment(request):
    return update_notification_setting(request, 'notify_new_replied_comment')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_notify_new_upvote_on_project(request):
    return update_notification_setting(request, 'notify_new_upvote_on_project')

# Helper function to update a single notification setting
def update_notification_setting(request, setting_name):
    user_profile = request.user.profile
    value = request.data.get('value', True)
    
    if isinstance(value, str):
        setattr(user_profile, setting_name, value.lower() == 'true')
    else:
        setattr(user_profile, setting_name, bool(value))

    user_profile.save()

    return Response({setting_name: getattr(user_profile, setting_name)}, status=status.HTTP_200_OK)




# In your users/views.py

from django.contrib.auth import update_session_auth_hash


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(old_password):
        return Response({"error": "Wrong password."}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    update_session_auth_hash(request, user)  # Important for keeping the session active
    return Response({"success": "Password updated successfully."}, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_password(request):
    user = request.user
    password = request.data.get('password')
    
    if user.check_password(password):
        return Response(status=status.HTTP_200_OK)
    else:
        return Response({"error": "Wrong password."}, status=status.HTTP_400_BAD_REQUEST)


# from django.db import transaction

# @api_view(['DELETE'])
# @permission_classes([IsAuthenticated])
# def deactivate_account(request):
#     try:
#         user = request.user
#         with transaction.atomic():
#             # Perform all deletion operations inside a transaction to ensure data integrity
#             # Delete user's profile and any related data first
#             user.profile.delete()
            
#             # If there are other related models, make sure to delete those as well
#             # e.g., user.posts.delete(), user.comments.delete(), etc.

#             # Finally, delete the user itself
#             user.delete()
#             return Response({"success": "Account deactivated and deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
#     except User.DoesNotExist:
#         return Response({"error": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)
#     except Exception as e:
#         # If anything goes wrong, return a server error
#         return Response({"error": "An error occurred while deleting the account."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deactivate_account(request):
    print("deactivate_account view has been called.")

    try:
        user = request.user
        print(f"User to be deactivated: {user.username}")


        # Fetch the user profile related to the user.
        # If the profile does not exist, it will raise User.DoesNotExist exception.
        profile = user.profile
        print(f"User profile: {profile}")

        with transaction.atomic():
            print("Starting transaction to delete user data.")

            print("Deleting likes related to the user...")
            profile.like_set.all().delete()
            print("Deleted likes.")

            print("Deleting votes related to the user...")
            profile.vote_set.all().delete()
            print("Deleted votes.")
            
            print("Deleting user notifications...")
            profile.user_notifications.all().delete()
            print("Deleted user notifications.")
            
            print("Deleting follower notifications...")
            profile.follower_notifications.all().delete()
            print("Deleted follower notifications.")

            print("Deleting vote notifications...")
            profile.vote_notifications.all().delete()
            print("Deleted vote notifications.")
            
            print("Deleting comments and replies...")
            profile.com_set.all().delete()
            print("Deleted comments and replies.")

            print("Deleting messages sent by the user...")
            profile.sends_sent_messages.all().delete()
            print("Deleted sent messages.")

            print("Deleting messages received by the user...")
            profile.received_messages.all().delete()
            print("Deleted received messages.")

            print("Deleting favorites...")
            user.favorite_set.all().delete()
            print("Deleted favorites.")

            print("Deleting projects associated with the user...")
            profile.project_set.all().delete()
            print("Deleted projects.")

            # Deleting the user and profile
            print("Deleting the user account...")
            user.delete()
            print("Deleted user account.")

            print("Deleting the user profile...")
            profile.delete()
            print("Deleted user profile.")

            
            return Response({"success": "Account deactivated and deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({"error": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        # In a production environment, consider logging this exception as well.
        return Response({"error": "An error occurred while deleting the account: " + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addAttendance(request, project_id):
    user = request.user
    project = Project.objects.get(id=project_id)

    attendance, created = Attendance.objects.get_or_create(attendee=user.profile, project=project)
    
    if created:
        return Response({'detail': 'Added to Attendance!'})
    return Response({'detail': 'Already attending!'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def removeAttendance(request, project_id):
    user = request.user
    attendance = Attendance.objects.filter(attendee=user.profile, project__id=project_id)
    
    if attendance.exists():
        attendance.delete()
        return Response({'detail': 'Removed from Attendance!'})
    return Response({'detail': 'Not attending!'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def checkAttendance(request, project_id):
    user = request.user
    is_attending = Attendance.objects.filter(attendee=user.profile, project__id=project_id).exists()
    return Response({'isAttending': is_attending})

# views.py

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_attendees(request, project_id):
    attendees = Attendance.objects.filter(project__id=project_id)
    serializer = AttendanceSerializer(attendees, many=True)
    return Response(serializer.data)
