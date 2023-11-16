from users.models import Profile
from django import template

register = template.Library()

@register.filter
def has_blocked(profile, user_profile_id):
    return profile.has_blocked(user_profile_id)
