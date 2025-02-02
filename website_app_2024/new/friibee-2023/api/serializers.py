from rest_framework import serializers
from projects.models import Project, Tag, Review, Image
from users.models import Profile, Favorite, Msg, Thread, ThreadParticipants


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


# class ProfileSerializer(serializers.ModelSerializer):
#     followers_count = serializers.ReadOnlyField()
#     following_count = serializers.ReadOnlyField()
    
#     class Meta:
#         model = Profile
#         fields = '__all__'


from rest_framework import serializers
from uuid import UUID

class ProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.ReadOnlyField()
    following_count = serializers.ReadOnlyField()

    blocked_users = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Profile.objects.all(), 
        required=False,
        allow_empty=True  # Allow empty lists
    )
    followed_tags = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Tag.objects.all(), 
        required=False,
        allow_empty=True  # Allow empty lists
    )

    def validate_blocked_users(self, value):
        """
        Custom validation for blocked_users field.
        Skip validation if list is empty.
        """
        if not value:
            return value  # Skip validation if list is empty
        validated_data = []
        for user_id in value:
            try:
                validated_uuid = UUID(str(user_id), version=4)
                validated_data.append(validated_uuid)
            except ValueError:
                raise serializers.ValidationError("Each blocked user must be a valid UUID.")
        return validated_data

    def validate_followed_tags(self, value):
        """
        Custom validation for followed_tags field.
        Skip validation if list is empty.
        """
        if not value:
            return value  # Skip validation if list is empty
        validated_data = []
        for tag_id in value:
            try:
                validated_uuid = UUID(str(tag_id), version=4)
                validated_data.append(validated_uuid)
            except ValueError:
                raise serializers.ValidationError("Each followed tag must be a valid UUID.")
        return validated_data

    def to_representation(self, instance):
        """
        Convert `null` to empty string for certain fields.
        """
        ret = super().to_representation(instance)
        for field in ['name', 'email', 'username', 'location', 'bio', 'short_intro', 'social_facebook', 'social_twitter', 'social_instagram', 'social_youtube', 'social_website']:
            if ret.get(field) is None:
                ret[field] = ''
        return ret

    class Meta:
        model = Profile
        fields = '__all__'




class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['image', 'uploaded_at']









class ProjectSerializer(serializers.ModelSerializer):
    owner = ProfileSerializer(many=False)
    tags = TagSerializer(many=True)
    upvotes = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, required=False)  # Add required=False for tags
    project_images = ImageSerializer(many=True, read_only=True)


    class Meta:
        model = Project
        fields = '__all__'

    def get_upvotes(self, obj):
        return obj.vote_count()

# class ProjectSerializer(serializers.ModelSerializer):
#     # owner = ProfileSerializer(many=False)
#     tags = TagSerializer(many=True)
#     upvotes = serializers.SerializerMethodField()
#     tags = TagSerializer(many=True, required=False)  # Add required=False for tags


#     class Meta:
#             model = Project
#             fields = '__all__'
#             extra_kwargs = {'owner': {'read_only': True}}  # Make owner field read-only

#     def get_upvotes(self, obj):
#         return obj.vote_count()
     

from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profile_image')

    def get_profile_image(self, obj):
        if hasattr(obj, 'profile') and obj.profile.profile_image:
            return obj.profile.profile_image.url
        return None  # Return a default URL or None

# serializers.py

class FavoriteSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(many=False)

    class Meta:
        model = Favorite
        fields = '__all__'



from rest_framework import serializers
from users.models import Notif


# class CommentSerializer(serializers.ModelSerializer):
#     user = ProfileSerializer(many=False)

#     class Meta:
#         model = Comment
#         fields = '__all__'

from projects.models import Com
from rest_framework import serializers

class RecursiveSerializer(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

# serializers.py
class ComSerializer(serializers.ModelSerializer):
    replies = RecursiveSerializer(many=True, read_only=True)
    user = ProfileSerializer(read_only=True)

    project_title = serializers.ReadOnlyField(source='project.title')
    project_image = serializers.ImageField(source='project.featured_image')
    project = ProjectSerializer(read_only=True)  # Add this line to include all project info

    class Meta:
        model = Com
        fields = ['id', 'user', 'content', 'created_at', 'replies', 'project_title', 'project_image', 'project']





# serializers.py
from rest_framework import serializers
from users.models import Msg, Profile
from .serializers import ProfileSerializer

from rest_framework import serializers

class MsgSerializer(serializers.ModelSerializer):
    sender = ProfileSerializer(read_only=True)  # Existing line

    class Meta:
        model = Msg
        fields = '__all__'
        extra_kwargs = {
            'thread': {'read_only': True},
            'recipient': {'read_only': True},
        }

    def to_representation(self, instance):
        # Calling the super method to get the regular serialized data
        ret = super(MsgSerializer, self).to_representation(instance)
        
        # Printing the serialized data
        print("Serialized Data:", ret)

        return ret


# class MessageSerializer(serializers.ModelSerializer):
#     created = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', required=False)
#     sender = ProfileSerializer(many=False, read_only=True) # Provide details about the sender
#     recipient = ProfileSerializer(many=False, read_only=True) # Provide details about the recipient
    
#     class Meta:
#         model = Msg
#         fields = '__all__'






# class MessageSerializer(serializers.ModelSerializer):
#     created = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', required=False)
#     sender = ProfileSerializer(many=False, read_only=True) # Provide details about the sender
#     recipient = ProfileSerializer(many=False, read_only=True) # Provide details about the recipient
#     replies = serializers.SerializerMethodField()
#     thread = serializers.PrimaryKeyRelatedField(queryset=Thread.objects.all(), required=False)

#     class Meta:
#         model = Msg
#         fields = fields = '__all__'

#     def get_replies(self, obj):
#         if obj.replies:
#             return MessageSerializer(obj.replies, many=True).data
#         return None


from rest_framework import serializers
from users.models import Messg, Thrd

class MessageSerializer(serializers.ModelSerializer):
    sender = ProfileSerializer(read_only=True)
    recipient = ProfileSerializer(read_only=True)
    viewed_by = ProfileSerializer(many=True, read_only=True)

    parent = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Messg
        fields = ['id', 'sender', 'recipient', 'thread', 'body', 'timestamp', 'parent', 'viewed', 'viewed_timestamp', 'viewed_by']  # Add 'viewed_by' here

class ThreadSerializer(serializers.ModelSerializer):
    participants = ProfileSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    latest_message_timestamp = serializers.SerializerMethodField()
    seen_by_user = serializers.SerializerMethodField()

    def get_seen_by_user(self, obj):
        request = self.context.get('request', None)
        if request:
            latest_message = obj.messages.last()
            # Check if the latest message is not sent by the current user and if it has been viewed.
            if latest_message and latest_message.sender != request.user.profile and latest_message.viewed:
                return True
            return False
        return None  # or appropriate default

    class Meta:
        model = Thrd
        fields = ['id', 'participants', 'messages', 'latest_message_timestamp', 'seen_by_user']

    def get_latest_message_timestamp(self, obj):
        return obj.latest_message_timestamp()
    


class NotificationSerializer(serializers.ModelSerializer):
    user = ProfileSerializer(read_only=True)
    follower = ProfileSerializer(read_only=True)

    comment = ComSerializer(read_only=True)
    message = MessageSerializer(read_only=True)

    voting_user = ProfileSerializer(read_only=True)  # Add this line to include voting user details

    project = ProjectSerializer(read_only=True)  # Serialize the related project

    replied_comment = ComSerializer(read_only=True)

    class Meta:
        model = Notif
        fields = '__all__'  # Or list the fields you want to include.
