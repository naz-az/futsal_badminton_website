from .models import Notification, Message

# def notification_counts(request):
#     if request.user.is_authenticated:
#         profile = request.user.profile
#         messageRequests = profile.messages.all()
#         notifications = Notification.objects.filter(profile=profile, seen=False)

#         unseen_notifications_count = notifications.filter(seen=False).count()
#         unreadCount = messageRequests.filter(is_read=False).count()
#         totalMessagesCount = messageRequests.count()
#     else:
#         unseen_notifications_count = 0
#         unreadCount = 0
#         totalMessagesCount = 0

#     return {
#         'unseen_notifications_count': unseen_notifications_count, 
#         'unreadCount': unreadCount,
#         'totalMessagesCount': totalMessagesCount
#     }


from .models import Notification, Message, User
from projects.models import Review
from django.db.models import Q

def notification_counts(request):
    if request.user.is_authenticated:
        profile = request.user.profile

        # # For messages
        # messageRequests = profile.messages.all()
        # unreadCount = messageRequests.filter(is_read=False).count()
        # totalInboxCount = messageRequests.count()
        # sentMessages = Message.objects.filter(sender=profile)
        # sentMessagesCount = sentMessages.count()

        # For notifications
        notifications = Notification.objects.filter(profile=profile, seen=False)
        unseen_notifications_count = notifications.count()

        # For reviews
        unseen_reviews = Review.objects.filter(project__owner=profile, seen=False)
        unseen_reviews_count = unseen_reviews.count()

        # For new followers
        new_followers = User.objects.filter(Q(following__in=[profile]) & Q(profile__followers_last_checked__lt=profile.followers_last_checked))
        new_followers_count = new_followers.count()

    else:
        unseen_notifications_count = 0
        # unreadCount = 0
        # totalInboxCount = 0
        unseen_reviews_count = 0
        new_followers_count = 0
        # sentMessagesCount = 0

    return {
        'unseen_notifications_count': unseen_notifications_count, 
        # 'unreadCount': unreadCount,
        # 'totalInboxCount': totalInboxCount,
        # 'sentMessagesCount': sentMessagesCount,
        'unseen_reviews_count': unseen_reviews_count,
        'new_followers_count': new_followers_count
    }
