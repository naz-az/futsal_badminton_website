from django.urls import path
from . import views

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('users/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('', views.getRoutes),
    path('projects/', views.getProjects),
    path('projects/random/', views.getRandomProjects, name='get-random-projects'),

    path('projects/<str:pk>/', views.getProject),

    path('tags/', views.getTags, name='tags-list'),

    path('remove-tag/', views.removeTag),


    path('profiles/', views.getProfiles),
    path('profiles/<uuid:profile_id>/', views.getProfile),  # Using uuid as the type as you're using UUID for the profile ID

    path('profiles/<uuid:profile_id>/follow/', views.followProfile),
    path('profiles/<uuid:profile_id>/unfollow/', views.unfollowProfile),

    path('profiles/<uuid:profile_id>/is_following/', views.is_following),
    path('profiles/following/', views.get_following_profiles),
    path('profiles/followers/', views.get_followers),

    path('profiles/<uuid:profile_id>/remove_follower/', views.remove_follower),


    path('profiles/<uuid:profile_id>/following/', views.get_user_following),  # Ensure the URL pattern is correct
    path('profiles/<uuid:profile_id>/followers/', views.get_user_followers),


    path('user/account/', views.getUserAccount, name="user-account"),

    path('user/edit-account/', views.editAccount, name="edit-account"),

    path('favorites/', views.getFavorites, name='get-favorites'),
    path('favorites/add/<str:project_id>/', views.addFavorite, name='add-favorite'),
    path('favorites/remove/<str:project_id>/', views.removeFavorite, name='remove-favorite'),
    path('favorites/is-favorite/<str:project_id>/', views.isFavorite, name='is-favorite'),

    path('profiles/<uuid:profile_id>/projects/', views.getProjects),
    

    path('projects/<str:pk>/comments/', views.projectComments),

    path('projects/<str:pk>/comments/<str:comment_id>/', views.projectComments),


    path('comments/<str:project_id>/', views.get_comments),
    path('comments/post/<str:project_id>/', views.post_comment),
    path('comments/delete/<uuid:comment_id>/', views.delete_comment),

# urls.py

    path('likes/add/<str:comment_id>/', views.addLike, name='add-like'),
    path('likes/remove/<str:comment_id>/', views.removeLike, name='remove-like'),
    path('likes/is-liked/<str:comment_id>/', views.isLiked, name='is-liked'),


    # urls.py
    path('vote/<str:project_id>/<str:vote_type>/', views.add_vote, name='add-vote'),
    path('vote/<str:project_id>/', views.get_user_vote, name='get-user-vote'),
    path('remove-vote/<str:project_id>/<str:vote_type>/', views.remove_vote, name='remove-vote'),


    path('create-project/', views.createProject),
# urls.py
    path('update-project/<str:project_id>/', views.updateProject),
    path('projects/<str:pk>/delete/', views.deleteProject),


    path('add-tag/', views.addTag),


    path('followed-tags/', views.getFollowedTags, name='get-followed-tags'),
    path('follow-tag/<uuid:tag_id>/', views.followTag, name='follow-tag'),
    path('unfollow-tag/<uuid:tag_id>/', views.unfollowTag, name='unfollow-tag'),


    path('block-user/<uuid:user_id>/', views.block_user),
    path('unblock-user/<uuid:user_id>/', views.unblock_user),
    path('blocked-users/', views.get_blocked_users),
    
    path('profiles/<uuid:profile_id>/is_blocked/', views.is_user_blocked),
    path('blocking-users/', views.get_blocking_users),


    path('register/', views.register_user, name='register'),

# '/api/followed-tags'
# `/api/follow-tag/${tagId}`
    # path('create-message/<str:pk>/', views.create_message, name="create-message"),
    # path('messages/inbox/', views.get_inbox_messages, name="get-inbox-messages"),
    # path('messages/sent/', views.get_sent_messages, name="get-sent-messages"),
    # path('messages/<uuid:message_id>/', views.get_message, name="get-message"), 
    # path('messages/delete/<uuid:message_id>/', views.delete_message, name="delete-message"),
    # path('messages/read/<uuid:pk>/', views.mark_message_as_read, name='mark_message_as_read'),

    # path('messages/thread/<uuid:thread_id>/', views.get_message_thread, name="get-message-thread"),

    # path('reply-to-message/<uuid:message_id>/', views.create_reply, name="create-reply"),

    # path('messages/', views.MsgListView, name='msg-list'),
    # path('messages/create/', views.MsgCreateView, name='msg-create'),

    # path('messages/<int:thread_id>/', views.get_messages, name='get-messages'),
    # path('send/', views.send_message, name='send-message'),
    # path('reply/<uuid:msg_id>/', views.reply_to_message, name='reply-message'),

    path('notifications/', views.get_notifications),
    path('notifications/clear/', views.clear_all_notifications),

    path('notifications/mark_as_read/', views.mark_notification_as_read, name='mark_notification_as_read'),
    path('notifications/mark_all_as_read/', views.mark_all_notifications_as_read, name='mark_all_notification_as_read'),
    
    path('notifications/clear_message/', views.clear_message_notifications),

    path('get_notification_settings/', views.get_notification_settings),
    
    
    path('update_notification_setting/', views.update_notification_setting),

    path('update_notify_new_followers/', views.update_notify_new_followers),
    path('update_notify_new_messages/', views.update_notify_new_messages),
    path('update_notify_new_comment_on_project/', views.update_notify_new_comment_on_project),
    path('update_notify_new_replied_comment/', views.update_notify_new_replied_comment),
    path('update_notify_new_upvote_on_project/', views.update_notify_new_upvote_on_project),


    path('change-password/', views.change_password, name='change_password'),
    
    path('verify-password/', views.verify_password, name='verify_password'),

    path('deactivate-account/', views.deactivate_account, name='deactivate_account'),



    path('send_message/', views.send_message),
    path('threads/', views.list_threads),
    path('threads/<uuid:thread_id>/', views.thread_detail, name='thread_detail'),

    path('messages/<uuid:message_id>/mark_as_viewed/', views.mark_message_as_viewed, name='mark_message_as_viewed'),

]
