from django.db import models
import uuid

from django.db.models.deletion import CASCADE
# Create your models here.


    # upvotes = models.IntegerField(default=0)
    # downvotes = models.IntegerField(default=0)

from PIL import Image as PilImage
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys

from devsearch.storage_backends import B2MediaStorage

class Project(models.Model):
    owner = models.ForeignKey('users.Profile', null=True, blank=True, 
                              on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    featured_image = models.ImageField(
        null=True, blank=True, default="default.jpg", storage=B2MediaStorage())
    brand = models.CharField(max_length=2000, null=True, blank=True)
    deal_link = models.CharField(max_length=2000, null=True, blank=True)
    tags = models.ManyToManyField('Tag', blank=True)
    created = models.DateTimeField(auto_now_add=True)
    price = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)  
    location = models.CharField(max_length=1024, null=True, blank=True)  # New field for location
    start_date = models.DateTimeField(null=True, blank=True)  # New field for event start date/time
    end_date = models.DateTimeField(null=True, blank=True)    # New field for event end date/time

    id = models.UUIDField(default=uuid.uuid4, unique=True,
                          primary_key=True, editable=False)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['title']

    @property
    def imageURL(self):
        try:
            url = self.featured_image.url
        except:
            url = ''
        return url

    @property
    def reviewers(self):
        queryset = self.review_set.all().values_list('owner__id', flat=True)
        return queryset

    # Modify the save method
    def save(self, *args, **kwargs):
        # Process the featured image if it exists
        if self.featured_image:
            # Open the image directly from the InMemoryUploadedFile
            pil_img = PilImage.open(self.featured_image)
            output = BytesIO()

            # Resize the image
            if pil_img.height > 800 or pil_img.width > 800:
                output_size = (800, 800)
                pil_img.thumbnail(output_size, PilImage.Resampling.LANCZOS)

            # Save the resized image to the output
            pil_img.save(output, format='JPEG', quality=95)
            output.seek(0)

            # Change the ImageField to use the new resized image
            self.featured_image.save(self.featured_image.name, ContentFile(output.read()), save=False)

        super(Project, self).save(*args, **kwargs)

    def vote_count(self):
        up_votes = Vote.objects.filter(project=self, vote_type=Vote.UP).count()
        down_votes = Vote.objects.filter(project=self, vote_type=Vote.DOWN).count()
        return up_votes - down_votes



class Attendance(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    attendee = models.ForeignKey('users.Profile', on_delete=models.CASCADE)
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['project', 'attendee']]



class Tag(models.Model):
    name = models.CharField(max_length=200)
    created = models.DateTimeField(auto_now_add=True)
    id = models.UUIDField(default=uuid.uuid4, unique=True,
                          primary_key=True, editable=False)

    def __str__(self):
        return self.name



# models.py
from django.db import models
import uuid

class Vote(models.Model):
    UP = 'UP'
    DOWN = 'DOWN'
    VOTE_CHOICES = [
        (UP, 'Up'),
        (DOWN, 'Down'),
    ]

    user = models.ForeignKey('users.Profile', on_delete=models.CASCADE)  # Referencing Profile model
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=4, choices=VOTE_CHOICES)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['user', 'project']]

    def __str__(self):
        return f"{self.user.username}: {self.vote_type} on {self.project.title}"







from django.db import models
import uuid


class Rating(models.Model):
    user = models.ForeignKey('users.Profile', on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    value = models.IntegerField() # 1 for upvote, -1 for downvote, 0 for no vote



class Review(models.Model):
    owner = models.ForeignKey('users.Profile', on_delete=models.CASCADE, null=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    body = models.TextField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    seen = models.BooleanField(default=False)
    parent_review = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True)
    likes = models.PositiveIntegerField(default=0)  # This field will store the number of likes

    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    
    class Meta:
        pass

    def is_owner(self, user):
        return self.owner == user.profile
   
    def __str__(self):
        return self.body





from django.core.files import File

class Image(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_images', null=True)
    image = models.ImageField(upload_to='images/', storage=B2MediaStorage()) 
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Open the image using the file storage, not the local path
        img = PilImage.open(self.image)
        output = BytesIO()
        
        # Check if the image needs to be resized
        if img.height > 800 or img.width > 800:
            output_size = (800, 800)
            img.thumbnail(output_size, PilImage.ANTIALIAS)
        
        # Save the resized image to the output buffer
        img_format = 'JPEG' if img.mode == 'RGB' else 'PNG'  # Adjust format as needed
        img.save(output, format=img_format)
        output.seek(0)
        
        # Change the ImageField to use the new resized image
        self.image = File(output, self.image.name)
        
        # Save the model instance
        super().save(*args, **kwargs)
        output.close()
# class Comment(models.Model):
#     project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='comments')
#     user = models.ForeignKey('users.Profile', on_delete=models.CASCADE)
#     content = models.TextField()
#     parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
#     likes = models.ManyToManyField('users.Profile', related_name='comment_likes', blank=True)
#     created = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         ordering = ['-created']

from django.db import models
import uuid


class Com(models.Model):
    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    user = models.ForeignKey('users.Profile', on_delete=models.CASCADE)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.project.title}"

    @property
    def is_reply(self):
        return self.parent is not None
    

# models.py
from django.contrib.auth.models import User

class Like(models.Model):
    user = models.ForeignKey('users.Profile', on_delete=models.CASCADE)
    comment = models.ForeignKey('Com', on_delete=models.CASCADE, related_name='likes')
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['user', 'comment']]

    def __str__(self):
        return f"Like by {self.user.username} on comment {self.comment.id}"











# from django.db import models
# from django.contrib.auth import get_user_model

# class Vote(models.Model):
#     user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
#     project = models.ForeignKey(Project, on_delete=models.CASCADE)
#     vote = models.IntegerField(default=0)  # -1 for downvote, 1 for upvote

#     class Meta:
#         unique_together = ('user', 'project')  # Ensure one vote per user per project


