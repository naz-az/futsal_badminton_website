from django.contrib import admin

# Register your models here.

from .models import Profile, Skill, Messg, Thrd, Notif, Favorite

admin.site.register(Profile)
admin.site.register(Skill)
admin.site.register(Messg)

admin.site.register(Thrd)


admin.site.register(Notif)
admin.site.register(Favorite)
