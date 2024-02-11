from django.dispatch.dispatcher import receiver
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User
from django.urls import conf
from django.db.models import Q
from .models import Profile, Message, Notification, Favorite
from .forms import CustomUserCreationForm, ProfileForm, SkillForm
from .utils import searchProfiles, paginateProfiles
from projects.models import Project
from django.utils import timezone

def loginUser(request):
    page = 'login'

    if request.user.is_authenticated:
        return redirect('profiles')

    if request.method == 'POST':
        username = request.POST['username'].lower()
        password = request.POST['password']

        try:
            user = User.objects.get(username=username)
        except:
            messages.error(request, 'Username does not exist')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect(request.GET['next'] if 'next' in request.GET else 'account')

        else:
            messages.error(request, 'Username OR password is incorrect')

    return render(request, 'users/login_register.html')


def logoutUser(request):
    logout(request)
    messages.info(request, 'User was logged out!')
    return redirect('login')


def registerUser(request):
    page = 'register'
    form = CustomUserCreationForm()

    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.username = user.username.lower()
            user.save()

            messages.success(request, 'User account was created!')

            login(request, user)
            return redirect('edit-account')

        else:
            messages.success(
                request, 'An error has occurred during registration')

    context = {'page': page, 'form': form}
    return render(request, 'users/login_register.html', context)


def profiles(request):
    profiles, search_query = searchProfiles(request)

    custom_range, profiles = paginateProfiles(request, profiles, 9)
    context = {'profiles': profiles, 'search_query': search_query,
               'custom_range': custom_range}
    return render(request, 'users/profiles.html', context)


def userProfile(request, pk):
    profile = Profile.objects.get(id=pk)
    # profile = get_object_or_404(Profile, id=pk)

    topSkills = profile.skill_set.exclude(description__exact="")
    otherSkills = profile.skill_set.filter(description="")

    context = {'profile': profile, 'topSkills': topSkills,
               "otherSkills": otherSkills}
    return render(request, 'users/user-profile.html', context)


@login_required(login_url='login')
def userAccount(request):
    profile = request.user.profile

    # Calculate unseen notifications count here
    unseen_notifications_count = Notification.objects.filter(profile=profile, seen=False).count()

    skills = profile.skill_set.all()
    projects = profile.project_set.all()

    context = {'profile': profile, 'skills': skills, 'projects': projects, 'unseen_notifications_count': unseen_notifications_count}
    return render(request, 'users/account.html', context)


@login_required(login_url='login')
def editAccount(request):
    profile = request.user.profile
    form = ProfileForm(instance=profile)

    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()

            return redirect('account')

    context = {'form': form}
    return render(request, 'users/profile_form.html', context)

@login_required(login_url='login')
def deactivateAccount(request):
    user = request.user
    user.is_active = False
    # user.delete()
    user.save()
    return redirect('login')

@login_required(login_url='login')
def settingsPage(request):
    return render(request, 'users/settings.html')


@login_required(login_url='login')
def privacySettings(request):
    profiles = Profile.objects.exclude(id=request.user.profile.id)
    return render(request, 'users/privacy_settings.html', {'profiles': profiles})


@login_required(login_url='login')
def notificationSettings(request):
    return render(request, 'users/notification_settings.html')


@login_required(login_url='login')
def createSkill(request):
    profile = request.user.profile
    form = SkillForm()

    if request.method == 'POST':
        form = SkillForm(request.POST)
        if form.is_valid():
            skill = form.save(commit=False)
            skill.owner = profile
            skill.save()
            messages.success(request, 'Skill was added successfully!')
            return redirect('account')

    context = {'form': form}
    return render(request, 'users/skill_form.html', context)


@login_required(login_url='login')
def updateSkill(request, pk):
    profile = request.user.profile
    skill = profile.skill_set.get(id=pk)
    form = SkillForm(instance=skill)

    if request.method == 'POST':
        form = SkillForm(request.POST, instance=skill)
        if form.is_valid():
            form.save()
            messages.success(request, 'Skill was updated successfully!')
            return redirect('account')

    context = {'form': form}
    return render(request, 'users/skill_form.html', context)


@login_required(login_url='login')
def deleteSkill(request, pk):
    profile = request.user.profile
    skill = profile.skill_set.get(id=pk)
    if request.method == 'POST':
        skill.delete()
        messages.success(request, 'Skill was deleted successfully!')
        return redirect('account')

    context = {'object': skill}
    return render(request, 'delete_template.html', context)


@login_required(login_url='login')
def inbox(request):
    profile = request.user.profile
    profile.followers_last_checked = timezone.now()
    profile.save()
    messageRequests = profile.messages.all()
    totalMessagesCount = messageRequests.count()
    unreadCount = messageRequests.filter(is_read=False).count()
    context = {
        'messageRequests': messageRequests, 
        'unreadCount': unreadCount,
        'totalMessagesCount': totalMessagesCount
    }
    return render(request, 'users/inbox.html', context)

def viewMessage(request, pk):
    profile = request.user.profile
    current_message = profile.messages.get(id=pk)
    
    # Fetch all replies to the current_message using parent_message
    all_replies = Message.objects.filter(parent_message=current_message)
    
    all_messages = [current_message] + list(all_replies)

    # Mark the current message as read, if not already
    if not current_message.is_read:
        current_message.is_read = True
        current_message.save()

    context = {'all_messages': all_messages, 'main_subject': current_message.formatted_subject}
    return render(request, 'users/message.html', context)


# def createMessage(request, pk):
#     recipient = Profile.objects.get(id=pk)
#     form = MessageForm()
#     parent_msg = None
#     if 'parent_id' in request.GET:
#         parent_msg = Message.objects.get(id=request.GET['parent_id'])

#     try:
#         sender = request.user.profile
#     except:
#         sender = None

#     if request.method == 'POST':
#         form = MessageForm(request.POST)
#         if form.is_valid():
#             message = form.save(commit=False)
#             message.sender = sender
#             message.recipient = recipient

#             if sender:
#                 message.name = sender.name
#                 message.email = sender.email

#             message.parent_message = parent_msg
#             message.save()

#             messages.success(request, 'Your message was successfully sent!')
#             return redirect('user-profile', pk=recipient.id)

#     context = {'recipient': recipient, 'form': form, 'parent_msg': parent_msg}
#     return render(request, 'users/message_form.html', context)

@login_required(login_url='login')
def sentMessages(request):
    profile = request.user.profile
    sentMessages = Message.objects.filter(sender=profile)
    totalSentMessagesCount = sentMessages.count()
    context = {
        'sentMessages': sentMessages, 
        'totalSentMessagesCount': totalSentMessagesCount
    }
    return render(request, 'users/sent_messages.html', context)

from django.shortcuts import redirect

from django.http import JsonResponse

@login_required(login_url='login')
def deleteMessage(request, pk):
    profile = request.user.profile
    message = profile.messages.get(id=pk)
    if request.method == 'POST':
        message.delete()
        return JsonResponse({'success': True, 'message': 'Message was deleted successfully!'})
    else:
        return JsonResponse({'success': False, 'message': 'Request method not supported!'}, status=405)

    
@login_required(login_url='login')
def viewSentMessage(request, pk):
    profile = request.user.profile
    message = Message.objects.get(id=pk, sender=profile)
    context = {'message': message}
    return render(request, 'users/sent_message.html', context)

@login_required(login_url='login')
def deleteSentMessage(request, pk):
    profile = request.user.profile
    message = Message.objects.get(id=pk, sender=profile)
    if request.method == 'POST':
        message.delete()
        return JsonResponse({'success': True, 'message': 'Message was deleted successfully!'})
    else:
        return JsonResponse({'success': False, 'message': 'Request method not supported!'}, status=405)


from projects.models import Review


@login_required(login_url='login')
def inboxAndSentMessages(request):
    profile = request.user.profile
    profile.followers_last_checked = timezone.now()
    profile.save()
    messageRequests = profile.messages.exclude(sender=profile)
    sentMessages = Message.objects.filter(sender=profile)

    totalMessagesCount = messageRequests.count() + sentMessages.count()
    unreadCount = messageRequests.filter(is_read=False).count()

    context = {
        'messageRequests': messageRequests,
        'sentMessages': sentMessages,
        'unreadCount': unreadCount,
        'totalMessagesCount': totalMessagesCount,
        
    }
    return render(request, 'users/inbox_and_sent.html', context)


from django.utils import timezone

@login_required(login_url="login")
def notifications(request):
    profile = request.user.profile
    profile.followers_last_checked = timezone.now()
    profile.save()

    # For notifications
    notifications = Notification.objects.filter(profile=profile, seen=False)
    unseen_notifications_count = notifications.count()

    # For messages
    messages = Message.objects.filter(recipient=profile, is_read=False)
    message_count = messages.count()
    
    # For reviews, sorted in reverse chronological order
    seen_reviews = Review.objects.filter(project__owner=profile, seen=True)
    unseen_reviews = Review.objects.filter(project__owner=profile, seen=False)
    # Combine unseen and seen reviews and sort them in reverse chronological order
    all_reviews = (seen_reviews | unseen_reviews).order_by('-created')
    unseen_reviews_count = unseen_reviews.count()

    # For new followers
    new_followers = User.objects.filter(Q(following__in=[profile]) & Q(profile__followers_last_checked__lt=profile.followers_last_checked))
    new_followers_count = new_followers.count()

    # Mark messages and notifications as seen/read after fetching them
    messages.update(is_read=True)
    notifications.update(seen=True)
    unseen_reviews.update(seen=True)  

    # Update last_checked time for new followers' profiles
    for follower in new_followers:
        follower.profile.followers_last_checked = timezone.now()
        follower.profile.save()

    context = {
        'notifications': notifications, 
        'messages': messages, 
        'all_reviews': all_reviews,
        'unseen_notifications_count': unseen_notifications_count,
        'message_count': message_count,
        'unseen_reviews_count': unseen_reviews_count,
        'new_followers': new_followers,
        'new_followers_count': new_followers_count,
    }

    return render(request, 'users/notifications.html', context)


from django.shortcuts import render, get_object_or_404


def favorites(request):
    filter_by = request.GET.get('filter')
    favorites = Favorite.objects.filter(user=request.user)
    if filter_by == 'newest':
        favorites = favorites.order_by('-project__created')
    elif filter_by == 'highest_vote_ratio':
        favorites = favorites.order_by('-project__vote_ratio')
    context = {'favorites': favorites}
    return render(request, 'users/favorites.html', context)



@login_required
def add_favorite(request, project_id):
    project = Project.objects.get(id=project_id)
    Favorite.objects.get_or_create(user=request.user, project=project)
    return JsonResponse({'status': 'added'})

@login_required
def remove_favorite(request, project_id):
    project = Project.objects.get(id=project_id)
    Favorite.objects.filter(user=request.user, project=project).delete()
    return JsonResponse({'status': 'removed'})

@login_required(login_url='login')
def follow_user(request, pk):
    user_to_follow = get_object_or_404(Profile, id=pk)

    if request.user in user_to_follow.followers.all():
        # user already follows this profile, so no action needed
        pass
    else:
        user_to_follow.followers.add(request.user)
        # you can also add notification or success message here

    return redirect('user-profile', pk=user_to_follow.id)

@login_required(login_url='login')
def unfollow_user(request, pk, redirect_page):
    user_to_unfollow = get_object_or_404(Profile, id=pk)

    if request.user in user_to_unfollow.followers.all():
        user_to_unfollow.followers.remove(request.user)
        # you can also add notification or success message here
    else:
        # user does not follow this profile, so no action needed
        pass

    if redirect_page == 'following':
        return redirect('view-following', pk=request.user.id)
    else:
        return redirect('user-profile', pk=user_to_unfollow.id)



@login_required(login_url='login')
def view_followers(request, pk):
    user = get_object_or_404(User, id=pk)
    user.profile.followers_last_checked = timezone.now()
    user.profile.save()
    followers = user.profile.followers.all()

    context = {'users': followers}
    return render(request, 'users/followers.html', context)

@login_required(login_url='login')
def view_following(request, pk):
    user = get_object_or_404(User, id=pk)
    following = user.following.all()

    context = {'users': following}
    return render(request, 'users/following.html', context)


def about_footer(request):
    return render(request, 'about-footer.html')

def cookie_policy_footer(request):
    return render(request, 'cookie-policy-footer.html')

def copyright_policy_footer(request):
    return render(request, 'copyright-policy-footer.html')

def privacy_policy_footer(request):
    return render(request, 'privacy-policy-footer.html')

def terms_service_footer(request):
    return render(request, 'terms-service-footer.html')


# @login_required(login_url='login')
# def createNewMessage(request):
#     form = MessageForm()
#     sender = request.user.profile

#     # 1. Exclude profiles that the sender (Panda Bear) has blocked.
#     # 2. Exclude profiles that have blocked the sender (Panda Bear).
#     profiles = Profile.objects.exclude(blocked_users=sender).exclude(blocking_users=sender)

#     if request.method == 'POST':
#         recipient_id = request.POST.get('recipient')
#         recipient = Profile.objects.get(id=recipient_id)

#         # Check if the recipient has blocked the sender
#         if sender in recipient.blocking_users.all():
#             messages.error(request, 'You cannot send a message to this user.')
#             return redirect('inbox-sent-messages')

#         form = MessageForm(request.POST)
#         if form.is_valid():
#             message = form.save(commit=False)
#             message.sender = sender
#             message.recipient = recipient
#             message.name = sender.name
#             message.email = sender.email
#             message.save()

#             messages.success(request, 'Your message was successfully sent!')
#             return redirect('inbox-sent-messages')

#     context = {'form': form, 'profiles': profiles}
#     return render(request, 'users/new_message_form.html', context)



# @login_required(login_url='login')
# def replyMessage(request, pk):
#     main_message = Message.objects.get(id=pk)
    
#     form = MessageForm(initial={'subject': main_message.formatted_subject})
    
#     if request.method == 'POST':
#         form = MessageForm(request.POST)
#         if form.is_valid():
#             reply = form.save(commit=False)
#             reply.sender = request.user.profile
#             reply.recipient = main_message.sender
            
#             # Setting the parent_message for the reply to the main_message
#             reply.parent_message = main_message
            
#             reply.save()
#             messages.success(request, 'Reply sent successfully!')
#             return redirect('inbox-and-sent-messages')
    
#     context = {'main_message': main_message, 'form': form}
#     return render(request, 'users/reply_message_form.html', context)

# views.py
@login_required(login_url='login')
def updateBlockedUsers(request):
    if request.method == 'POST':
        blocked_users_ids = request.POST.getlist('blocked_users')
        blocked_users = Profile.objects.filter(id__in=blocked_users_ids)
        request.user.profile.blocked_users.set(blocked_users)
        messages.success(request, 'Blocked users updated!')
    return redirect('privacy-settings')
