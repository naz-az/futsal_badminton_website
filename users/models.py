from django.db import models
from django.contrib.auth.models import User
import uuid
# Create your models here.

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from PIL import Image as PilImage
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys

from devsearch.storage_backends import B2MediaStorage
import logging

logger = logging.getLogger(__name__)

class Profile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    email = models.EmailField(max_length=500, blank=True, null=True)
    username = models.CharField(max_length=200, blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    short_intro = models.CharField(max_length=200, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(
        null=True, blank=True, upload_to='profiles/', default="profiles/user-default.png", storage=B2MediaStorage())
    social_facebook = models.CharField(max_length=200, blank=True, null=True)
    social_twitter = models.CharField(max_length=200, blank=True, null=True)
    social_instagram = models.CharField(max_length=200, blank=True, null=True)
    social_youtube = models.CharField(max_length=200, blank=True, null=True)
    social_website = models.CharField(max_length=200, blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    followers = models.ManyToManyField(User, related_name='following', blank=True)
    followers_last_checked = models.DateTimeField(auto_now_add=True, null=True)
    blocked_users = models.ManyToManyField('self', symmetrical=False, blank=True, related_name="blocking_users")
    followed_tags = models.ManyToManyField('projects.Tag', blank=True, related_name='followers')

    notify_new_followers = models.BooleanField(default=True)
    notify_new_messages = models.BooleanField(default=True)  # Add this line for new message notifications
    notify_new_comment_on_project = models.BooleanField(default=True)  # New setting for comments on project
    notify_new_replied_comment = models.BooleanField(default=True) 
    notify_new_upvote_on_project = models.BooleanField(default=True)  # New setting for upvotes on projects

    def __str__(self):
        return str(self.username)

    class Meta:
        ordering = ['created']

    @property
    def imageURL(self):
        if self.profile_image:
            # Check if the file exists in storage
            if self.profile_image.storage.exists(self.profile_image.name):
                # If the file exists, generate a signed URL
                url = self.profile_image.storage.url(self.profile_image.name)
                return url
            else:
                # Log an error or handle the missing file case
                logger.error(f"File does not exist in storage: {self.profile_image.name}")
                return ''
        return ''

    
    def has_blocked(self, user_profile_id):
        return self.blocked_users.filter(id=user_profile_id).exists()

    @property
    def followers_count(self):
        return self.followers.count()

    @property
    def following_count(self):
        return self.user.following.count()
    
    
    def save(self, *args, **kwargs):
        # Debugging: Log the storage backend information
        logger.debug(f"Using storage backend: {self.profile_image.storage}")
        logger.debug(f"Default file name: {self.profile_image.name}")

        # Check if the default image file exists in the storage backend
        if self.profile_image and not self.profile_image.storage.exists(self.profile_image.name):
            logger.error(f"File does not exist: {self.profile_image.name}")
        else:
            logger.debug(f"File exists: {self.profile_image.name}")

        # Your existing image processing logic
        if self.profile_image and hasattr(self.profile_image, 'file'):
            img = PilImage.open(BytesIO(self.profile_image.read()))
            img_format = 'JPEG' if img.mode == 'RGB' else 'PNG'
            # Check if the image needs to be resized
            if img.height > 400 or img.width > 400:
                output_size = (400, 400)
                img.thumbnail(output_size, PilImage.Resampling.LANCZOS)  # Updated line
                output = BytesIO()
                img.save(output, format=img_format)
                output.seek(0)
                self.profile_image = InMemoryUploadedFile(output, 'ImageField', f"{self.profile_image.name.split('.')[0]}.{img_format.lower()}", f'image/{img_format.lower()}', sys.getsizeof(output), None)

        super().save(*args, **kwargs)



# models.py
from django.db import models
from django.contrib.auth.models import User
import uuid

from django.conf import settings



class Notif(models.Model):
    # Assuming 'Profile' is in the same app, otherwise you need to specify 'app_name.Profile'
    user = models.ForeignKey(
        'Profile',
        related_name='user_notifications', 
        null=False,  # Ensure this field cannot be null
        on_delete=models.CASCADE
    )
    follower = models.ForeignKey(
        'Profile',
        related_name='follower_notifications',
        on_delete=models.CASCADE,
        null=True,  # Allow null values for non-follower notifications
        blank=True,
    )

    read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    notification_sent = models.BooleanField(default=False)

    
    TYPE_CHOICES = (
    ('FOLLOWER', 'Follower'),
    ('COMMENT', 'Comment'),
    ('MESSAGE', 'Message'), 
    ('VOTE', 'Vote'),  # New notification type for votes
    ('REPLY', 'Reply'),  # New notification type for comment replies

)
    
    notification_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='FOLLOWER')
    comment = models.ForeignKey('projects.Com', on_delete=models.CASCADE, related_name='comment_notifications', null=True, blank=True)
    
    message = models.ForeignKey('CommMessage', on_delete=models.CASCADE, related_name='message_notifications', null=True, blank=True)

    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='vote_notifications',
        null=True,
        blank=True
    )

    voting_user = models.ForeignKey(
        'Profile',
        on_delete=models.CASCADE,
        related_name='vote_notifications',
        null=True,
        blank=True
    )

    replied_comment = models.ForeignKey(
        'projects.Com',
        on_delete=models.CASCADE,
        related_name='reply_notifications',
        null=True,
        blank=True
    )



    def __str__(self):
        if self.notification_type == 'FOLLOWER':
            return f"{self.follower} followed {self.user}"
        elif self.notification_type == 'COMMENT':
            return f"{self.comment.user} commented on {self.user}'s project"
        elif self.notification_type == 'MESSAGE':  # Add this condition
            return f"{self.user} received a message from {self.message.sender}"
        elif self.notification_type == 'VOTE':
            return f"{self.voting_user} voted for {self.project.title}"
        elif self.notification_type == 'REPLY':
            return f"{self.user} received a reply from {self.comment.user}"
        
        
import uuid
from django.db import models
from django.contrib.auth.models import User

# class Thrd(models.Model):  
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     participants = models.ManyToManyField(Profile)

#     def __str__(self):
#         return str(self.id)
    
#     def latest_message_timestamp(self):
#         last_message = self.messages.order_by('-timestamp').first()
#         return last_message.timestamp if last_message else None

# from django.utils import timezone
 
# class Messg(models.Model):  
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)
#     sender = models.ForeignKey(Profile, related_name='sends_sent_messages', on_delete=models.CASCADE)
#     recipient = models.ForeignKey(Profile, related_name='received_messages', on_delete=models.CASCADE)
#     thread = models.ForeignKey(Thrd, related_name='messages', on_delete=models.CASCADE)
#     body = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)
#     viewed = models.BooleanField(default=False)
#     viewed_timestamp = models.DateTimeField(null=True, blank=True)  # Add this line
#     viewed_by = models.ManyToManyField(Profile, related_name='viewed_messages', blank=True)


#     def __str__(self):
#         return f"From {self.sender} to {self.recipient} - {self.body[:30]}"


#     def is_latest_in_thread(self):
#         return self == self.thread.messages.latest('timestamp')

#     def mark_viewed(self, profile):
#         """Marks the message as viewed by a given profile if the profile is not the sender."""
#         if self.sender != profile and not self.viewed_by.filter(id=profile.id).exists():
#             self.viewed_by.add(profile)
#             self.viewed = True
#             self.viewed_timestamp = timezone.now()
#             self.save()


class Skill(models.Model):
    owner = models.ForeignKey(
        Profile, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    id = models.UUIDField(default=uuid.uuid4, unique=True,
                          primary_key=True, editable=False)

    def __str__(self):
        return str(self.name)


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['user', 'project']]

    def __str__(self):
        return self.project.title





import uuid
from django.db import models
from django.contrib.auth.models import User

from django.utils import timezone




class DiscussionThread(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = models.ManyToManyField(Profile, related_name='discussion_threads')

    def __str__(self):
        return str(self.id)

    def latest_message_timestamp(self):
        last_message = self.comm_messages.order_by('-timestamp').first()
        return last_message.timestamp if last_message else None

class CommMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)
    sender = models.ForeignKey(Profile, related_name='sent_comm_messages', on_delete=models.CASCADE)
    recipient = models.ForeignKey(Profile, related_name='received_comm_messages', on_delete=models.CASCADE)
    thread = models.ForeignKey(DiscussionThread, related_name='comm_messages', on_delete=models.CASCADE)
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    viewed = models.BooleanField(default=False)
    viewed_timestamp = models.DateTimeField(null=True, blank=True)
    viewed_by = models.ManyToManyField(Profile, related_name='viewed_comm_messages', blank=True)

    def __str__(self):
        return f"From {self.sender} to {self.recipient} - {self.body[:30]}"

    def is_latest_in_thread(self):
        return self == self.thread.comm_messages.latest('timestamp')

    def mark_viewed(self, profile):
        if self.sender != profile and not self.viewed_by.filter(id=profile.id).exists():
            self.viewed_by.add(profile)
            self.viewed = True
            self.viewed_timestamp = timezone.now()
            self.save()
