from django.contrib import admin

# Register your models here.

from .models import Profile, Skill, Msg, Thrd, Notif

admin.site.register(Profile)
admin.site.register(Skill)
admin.site.register(Msg)

admin.site.register(Thrd)


admin.site.register(Notif)
