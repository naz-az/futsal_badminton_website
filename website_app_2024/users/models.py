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
        null=True, blank=True, upload_to='profiles/', default="profiles/user-default.png")
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
        try:
            url = self.profile_image.url
        except:
            url = ''
        return url
    
    def has_blocked(self, user_profile_id):
        return self.blocked_users.filter(id=user_profile_id).exists()

    @property
    def followers_count(self):
        return self.followers.count()

    @property
    def following_count(self):
        return self.user.following.count()
    
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.profile_image:
            img_path = self.profile_image.path
            img = PilImage.open(img_path)

            if img.height > 400 or img.width > 400:
                output_size = (400, 400)
                img.thumbnail(output_size)
                img.save(img_path)

            print(f"Resized Profile Image Size: {img.size}")






# models.py
from django.db import models
from django.contrib.auth.models import User
import uuid

from django.conf import settings

# models.py

# ...

# class Noti(models.Model):
#     # Assuming 'Profile' is in the same app, otherwise you need to specify 'app_name.Profile'
#     user = models.ForeignKey(
#         'Profile',
#         related_name='gg', 
#         on_delete=models.CASCADE
#     )
#     follower = models.ForeignKey(
#         'Profile',
#         related_name='ff',  # This is fine as long as no other FK has the same related_name
#         on_delete=models.CASCADE,
#         default=1  # Be sure to handle this default appropriately
#     )
#     read = models.BooleanField(default=False)
#     timestamp = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.follower} followed {self.user}"


# class Notif(models.Model):
#     # Assuming 'Profile' is in the same app, otherwise you need to specify 'app_name.Profile'
#     user = models.ForeignKey(
#         'Profile',
#         related_name='user_notifications', 
#         null=False,  # Ensure this field cannot be null
#         on_delete=models.CASCADE
#     )
#     follower = models.ForeignKey(
#         'Profile',
#         related_name='follower_notifications',  # This is fine as long as no other FK has the same related_name
#         on_delete=models.CASCADE,
#     )

#     read = models.BooleanField(default=False)
#     timestamp = models.DateTimeField(auto_now_add=True)
    
    
#     def __str__(self):
#         return f"{self.follower} followed {self.user}"


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
    
    message = models.ForeignKey('Messg', on_delete=models.CASCADE, related_name='message_notifications', null=True, blank=True)

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

class Thrd(models.Model):  # Renamed from Thread
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = models.ManyToManyField(Profile)

    def __str__(self):
        return str(self.id)
    
    def latest_message_timestamp(self):
        last_message = self.messages.order_by('-timestamp').first()
        return last_message.timestamp if last_message else None

from django.utils import timezone
 
class Messg(models.Model):  # Renamed from Message
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)
    sender = models.ForeignKey(Profile, related_name='sends_sent_messages', on_delete=models.CASCADE)
    recipient = models.ForeignKey(Profile, related_name='received_messages', on_delete=models.CASCADE)
    thread = models.ForeignKey(Thrd, related_name='messages', on_delete=models.CASCADE)
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    viewed = models.BooleanField(default=False)
    viewed_timestamp = models.DateTimeField(null=True, blank=True)  # Add this line
    viewed_by = models.ManyToManyField(Profile, related_name='viewed_messages', blank=True)


    def __str__(self):
        return f"From {self.sender} to {self.recipient} - {self.body[:30]}"


    def is_latest_in_thread(self):
        return self == self.thread.messages.latest('timestamp')

    def mark_viewed(self, profile):
        """Marks the message as viewed by a given profile if the profile is not the sender."""
        if self.sender != profile and not self.viewed_by.filter(id=profile.id).exists():
            self.viewed_by.add(profile)
            self.viewed = True
            self.viewed_timestamp = timezone.now()
            self.save()




class ThreadParticipants(models.Model):
    thread = models.ForeignKey('Thread', on_delete=models.CASCADE)
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE)

    class Meta:
        unique_together = ['thread', 'profile']

class Thread(models.Model):
    participants = models.ManyToManyField(Profile, through=ThreadParticipants)


class Msg(models.Model):
    sender = models.ForeignKey(
        Profile, on_delete=models.SET_NULL, null=True, blank=True)
    recipient = models.ForeignKey(
        Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name="msg_recipients")
    name = models.CharField(max_length=200, null=True, blank=True)
    email = models.EmailField(max_length=200, null=True, blank=True)
    subject = models.CharField(max_length=200, null=True, blank=True)
    parent_msg = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    body = models.TextField()
    is_read = models.BooleanField(default=False, null=True)
    created = models.DateTimeField(auto_now_add=True)
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, null=True)

    id = models.UUIDField(default=uuid.uuid4, unique=True,
                          primary_key=True, editable=False)

    def __str__(self):
        return self.body[:30]

    class Meta:
        ordering = ['is_read', '-created']


    # def save(self, *args, **kwargs):
    #     print("Inside the save method of Profile model") # <-- Add this print statement

    #     # Open the uploaded image
    #     img = PilImage.open(self.profile_image)
    #     output = BytesIO()

    #     # Resize the image and save it into output object to get an image sharpness & detail enhanced
    #     img = img.resize((300,300)) 
    #     img.save(output, format='JPEG', quality=100)
    #     output.seek(0)

    #     # Change the imagefield value to be the newley modifed image value
    #     self.profile_image = InMemoryUploadedFile(output, 'ImageField', "%s.jpg" %self.profile_image.name.split('.')[0], 'image/jpeg', sys.getsizeof(output), None)

    #     super().save(*args, **kwargs)



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


class Message(models.Model):
    sender = models.ForeignKey(
        Profile, on_delete=models.SET_NULL, null=True, blank=True)
    recipient = models.ForeignKey(
        Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name="message_recipients")
    name = models.CharField(max_length=200, null=True, blank=True)
    email = models.EmailField(max_length=200, null=True, blank=True)
    subject = models.CharField(max_length=200, null=True, blank=True)
    body = models.TextField()
    is_read = models.BooleanField(default=False, null=True) 
    created = models.DateTimeField(auto_now_add=True)
    parent_message = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    
    id = models.UUIDField(default=uuid.uuid4, unique=True,
                          primary_key=True, editable=False)

    def __str__(self):
        return self.subject

    class Meta:
        ordering = ['is_read', '-created']

    @property
    def reply_count(self):
        count = 0
        message = self
        while message.parent_message:
            count += 1
            message = message.parent_message
        return count

    @property
    def formatted_subject(self):
        if self.parent_message:
            if not self.subject.startswith('Re: '):
                return f"Re: {self.subject}"
        return self.subject


    def save(self, *args, **kwargs):
        # Removing this logic to avoid redundancy.
        # if self.parent_message and not self.subject.startswith('Re: '):
        #     self.subject = f'Re: {self.parent_message.subject}'
        super(Message, self).save(*args, **kwargs)


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('message', 'Message'),
        ('comment', 'Comment'),
        ('vote', 'Vote'),  # Add this
    )
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="notifications")
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    created = models.DateTimeField(auto_now_add=True)
    seen = models.BooleanField(default=False)
    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)

    def __str__(self):
        return f"{self.sender.username} {self.notification_type} {self.profile.username}"


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['user', 'project']]

    def __str__(self):
        return self.project.title


from django.db import models
import uuid






