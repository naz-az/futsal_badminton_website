from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('login/', views.loginUser, name="login"),
    path('logout/', views.logoutUser, name="logout"),
    path('register/', views.registerUser, name="register"),

    path('profiles/', views.profiles, name="profiles"),
    path('profile/<str:pk>/', views.userProfile, name="user-profile"),
    # path('profile/<uuid:pk>/', views.userProfile, name="user-profile"),

    path('account/', views.userAccount, name="account"),

    path('edit-account/', views.editAccount, name="edit-account"),

    path('privacy-settings/', views.privacySettings, name="privacy-settings"),

    path('notification-settings/', views.notificationSettings, name="notification-settings"),

    path('create-skill/', views.createSkill, name="create-skill"),
    path('update-skill/<str:pk>/', views.updateSkill, name="update-skill"),
    path('delete-skill/<str:pk>/', views.deleteSkill, name="delete-skill"),

    path('inbox/', views.inbox, name="inbox"),

    path('message/<str:pk>/', views.viewMessage, name="message"),


    path('create-message/<str:pk>/', views.createMessage, name="create-message"),

    path('delete-message/<uuid:pk>/', views.deleteMessage, name='delete-message'),

    path('sent-messages/', views.sentMessages, name="sent-messages"),
    path('sent-message/<str:pk>/', views.viewSentMessage, name="sent-message"),

    path('delete-sent-message/<uuid:pk>/', views.deleteSentMessage, name='delete-sent-message'),

    path('notifications/', views.notifications, name="notifications"),

    path('favorites/', views.favorites, name="favorites"),
    path('favorites/add/<int:project_id>/', views.add_favorite, name='add_favorite'),
    path('favorites/remove/<int:project_id>/', views.remove_favorite, name='remove_favorite'),

    path('follow/<uuid:pk>/', views.follow_user, name="follow-user"),
    path('unfollow/<uuid:pk>/', views.unfollow_user, name="unfollow-user"),
    path('unfollow/<uuid:pk>/<str:redirect_page>/', views.unfollow_user, name="unfollow-user"),

    path('inbox-sent/', views.inboxAndSentMessages, name="inbox-sent-messages"),

    # path('followers/<uuid:pk>/', views.view_followers, name="view-followers"),
    # path('following/<uuid:pk>/', views.view_following, name="view-following"),

    path('followers/<int:pk>/', views.view_followers, name="view-followers"), 
    path('following/<int:pk>', views.view_following, name="view-following"),

    # path('followers/<uuid:pk>/', views.view_followers, name="view-followers"), 
    # path('following/<uuid:pk>', views.view_following, name="view-following"),

    path('change-password/', auth_views.PasswordChangeView.as_view(
    template_name='users/change_password.html',
    success_url = '/account'), 
    name='change-password'),

    path('deactivate-account/', views.deactivateAccount, name='deactivate-account'),

    path('settings/', views.settingsPage, name="settings"),


    path('about-footer/', views.about_footer, name="about-footer"),
    path('cookie-policy-footer/', views.cookie_policy_footer, name="cookie-policy-footer"),
    path('copyright-policy-footer/', views.copyright_policy_footer, name="copyright-policy-footer"),
    path('privacy-policy-footer/', views.privacy_policy_footer, name="privacy-policy-footer"),
    path('terms-service-footer/', views.terms_service_footer, name="terms-service-footer"),


    path('create-new-message/', views.createNewMessage, name="create-new-message"),
    
    path('update-blocked-users/', views.updateBlockedUsers, name='update-blocked-users'),

]


