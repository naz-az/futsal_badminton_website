from django.contrib import admin

# Register your models here.

from .models import Profile, Skill, Notif, Favorite, DiscussionThread, CommMessage

admin.site.register(Profile)
admin.site.register(Skill)

admin.site.register(DiscussionThread)
admin.site.register(CommMessage)

admin.site.register(Notif)
admin.site.register(Favorite)
