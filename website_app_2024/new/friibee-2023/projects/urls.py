from django.urls import path
from . import views

urlpatterns = [
    path('', views.projects, name="projects"),
    path('project/<str:pk>/', views.project, name="project"),

    path('create-project/', views.createProject, name="create-project"),

    path('update-project/<str:pk>/', views.updateProject, name="update-project"),

    path('delete-project/<str:pk>/', views.deleteProject, name="delete-project"),

    path('smart-food/', views.smart_food, name="smart-food"),

    path('swipe-page/', views.swipe_page, name='swipe-page'),

    path('toggle-favorite/<str:pk>/', views.add_remove_favorite, name="toggle-favorite"),

    path('categories/', views.categories_view, name='categories'),

    # path('project/<str:pk>/upvote/', views.upvote_project, name="upvote_project"),
    # path('project/<str:pk>/downvote/', views.downvote_project, name="downvote_project"),

    path('toggle-like/<str:commentId>/', views.toggle_like, name="toggle_like"),

]
