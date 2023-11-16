from django.core import paginator
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse  # Add JsonResponse import here
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Project, Tag
from .forms import ProjectForm
from .utils import searchProjects, paginateProjects
from .forms import ImageUploadForm  # import your image upload form
from .models import Image  # import your image model
from django.views.decorators.csrf import csrf_exempt  # To bypass csrf for demo
import requests
from django.shortcuts import render, get_object_or_404, redirect
from .models import Review, Project


def projects(request):
    projects, search_query = searchProjects(request)

    filter_type = request.GET.get('filter')
    if filter_type == 'top':
        projects = projects.order_by('-vote_total')
    elif filter_type == 'new':
        projects = projects.order_by('-created')

    custom_range, projects = paginateProjects(request, projects, 6)


    context = {'projects': projects,
               'search_query': search_query, 'custom_range': custom_range, 'filter_type': filter_type}
    return render(request, 'projects/projects.html', context)



def project(request, pk):
    projectObj = Project.objects.get(id=pk)
    related_projects = Project.objects.filter(tags__in=projectObj.tags.all()).distinct().exclude(id=projectObj.id)[:5]
    is_favorited = False
    if request.user.is_authenticated:
        is_favorited = Favorite.objects.filter(user=request.user, project=projectObj).exists()

    comments = projectObj.comments.filter(parent=None)
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.user = request.user.profile
            comment.project = projectObj
            parent_id = request.POST.get('parent')
            if parent_id:
                comment.parent = Comment.objects.get(id=parent_id)
            comment.save()

    else:
        form = CommentForm()

    if 'delete_comment' in request.POST:
        comment_id = request.POST.get('delete_comment')
        comment = Comment.objects.get(id=comment_id)
        if comment.user == request.user.profile: # Ensure the user deleting the comment is the owner
            comment.delete()
        return redirect('project', pk=projectObj.id) # Redirect back to the project page

    user_rating = None
    if request.user.is_authenticated:
        user_rating = Rating.objects.filter(user=request.user.profile, project=projectObj).first()

    context = {
        'project': projectObj,
        'is_favorited': is_favorited,
        'related_projects': related_projects,
        'comments': comments,
        'CommentForm': form,
        'user_vote': user_rating

    }
    return render(request, 'projects/single-project.html', context)

# from django.http import HttpResponseRedirect

# def upvote_project(request, pk):
#     project = Project.objects.get(id=pk)
#     user_profile = request.user.profile

#     # Providing an initial value for the 'value' field
#     rating, created = Rating.objects.get_or_create(user=user_profile, project=project, defaults={'value': 1})

#     if not created:
#         if rating.value == 1:
#             rating.delete()
#             project.upvotes -= 1
#         else:
#             rating.value = 1
#             project.upvotes += 1
#             project.downvotes -= 1
#             rating.save()
#     else:
#         project.upvotes += 1

#     project.save()
#     return HttpResponseRedirect(request.META.get('HTTP_REFERER'))

# def downvote_project(request, pk):
#     project = Project.objects.get(id=pk)
#     user_profile = request.user.profile

#     # Providing an initial value for the 'value' field
#     rating, created = Rating.objects.get_or_create(user=user_profile, project=project, defaults={'value': -1})

#     if not created:
#         if rating.value == -1:
#             rating.delete()
#             project.downvotes -= 1
#         else:
#             rating.value = -1
#             project.downvotes += 1
#             project.upvotes -= 1
#             rating.save()
#     else:
#         project.downvotes += 1

#     project.save()
#     return HttpResponseRedirect(request.META.get('HTTP_REFERER'))



def toggle_like(request, commentId):
    comment = Comment.objects.get(id=commentId)
    profile = request.user.profile

    if profile in comment.likes.all():
        comment.likes.remove(profile)
        status = "unliked"
    else:
        comment.likes.add(profile)
        status = "liked"

    like_count = comment.likes.count()  # Fetch the updated like count
    return JsonResponse({"status": status, "like_count": like_count})


from django.http import JsonResponse
from django.views.decorators.http import require_POST

from django.http import JsonResponse


@login_required(login_url="login")
def createProject(request):
    profile = request.user.profile
    form = ProjectForm()

    if request.method == 'POST':
        newtags = request.POST.get('newtags').replace(',',  " ").split()
        form = ProjectForm(request.POST, request.FILES)
        
        if form.is_valid():
            project = form.save(commit=False)
            project.owner = profile
            project.save()

            # Debug Print
            print(request.FILES)

            # Handle additional image uploads for the project
            for i in range(1, 4):
                image_field = 'additional_image_' + str(i)
                
                # Debug Print
                print(f"Saving image from field: {image_field}")
                
                if image_field in request.FILES:
                    Image.objects.create(project=project, image=request.FILES[image_field])

            for tag in newtags:
                tag, created = Tag.objects.get_or_create(name=tag)
                project.tags.add(tag)

            return redirect('account')

    context = {'form': form}
    return render(request, "projects/project_form.html", context)


@login_required(login_url="login")
def updateProject(request, pk):
    profile = request.user.profile
    project = profile.project_set.get(id=pk)
    form = ProjectForm(instance=project)

    if request.method == 'POST':
        newtags = request.POST.get('newtags').replace(',',  " ").split()
        form = ProjectForm(request.POST, request.FILES, instance=project)

        if form.is_valid():
            project = form.save(commit=False)
            project.owner = profile
            project.save()

            # Debug Print
            print(request.FILES)

            for i in range(1, 4):
                image_field = 'additional_image_' + str(i)
                
                # Debug Print
                print(f"Checking for image in field: {image_field}")
                
                if image_field in request.FILES:
                    existing_image = Image.objects.filter(project=project, image__icontains=image_field).first()
                    if existing_image:
                        existing_image.image = request.FILES[image_field]
                        existing_image.save()
                    else:
                        Image.objects.create(project=project, image=request.FILES[image_field])

            for tag in newtags:
                tag, created = Tag.objects.get_or_create(name=tag)
                project.tags.add(tag)

            return redirect('account')

    context = {'form': form, 'project': project}
    return render(request, "projects/project_form.html", context)


@login_required(login_url="login")
def deleteProject(request, pk):
    profile = request.user.profile
    project = profile.project_set.get(id=pk)
    if request.method == 'POST':
        project.delete()
        return redirect('projects')
    context = {'object': project}
    return render(request, 'delete_template.html', context)

@csrf_exempt
@login_required(login_url="login")
def smart_food(request):
    if request.method == 'POST':
        form = ImageUploadForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            image = Image.objects.latest('id')
            image_url = request.build_absolute_uri(image.image.url)
            # Image processing (You need to replace `YOUR_API_ENDPOINT` with your actual API endpoint)
            response = requests.post('YOUR_API_ENDPOINT', data={'image': image_url})
            response_data = json.loads(response.text)
            # you may want to save this response in your database for future use
            return JsonResponse(response_data)
    else:
        form = ImageUploadForm()
    return render(request, 'projects/smart_food.html', {'form': form})


@csrf_exempt
@login_required(login_url="login")
def smart_food(request):
    # clear the session if the 'clear' query parameter is set to 'true'
    if request.GET.get('clear') == 'true':
        if 'class' in request.session:
            del request.session['class']
        if 'confidence' in request.session:
            del request.session['confidence']
        return redirect('smart-food')

    if request.method == 'POST':
        form = ImageUploadForm(request.POST, request.FILES)
        if form.is_valid():
            image = form.save()

            # send POST request to FastAPI server with image
            url = "http://localhost:8001/predict"
            files = {'file': open(image.image.path, 'rb')}
            response = requests.post(url, files=files)

            # parse the response
            result = response.json()
            class_label = result['class']
            confidence = result['confidence']

            # store the results in the session
            request.session['class'] = class_label
            request.session['confidence'] = confidence
            request.session['image_path'] = image.image.url  # store the image path

            # redirect back to the same page
            return redirect('smart-food')

    else:
        form = ImageUploadForm()

    class_label = request.session.get('class', None)
    confidence = request.session.get('confidence', None)
    image_path = request.session.get('image_path', None)

    return render(request, 'projects/smart_food.html', {
        'form': form,
        'class': class_label,
        'confidence': confidence,
        'image_path': image_path
    })


import json

def swipe_page(request):
    projects = Project.objects.all()

    # Check if the user is authenticated
    if request.user.is_authenticated:
        favorites = Favorite.objects.filter(user=request.user)
        favorite_project_ids = set(favorite.project_id for favorite in favorites)  # list of ids of favorited projects
    else:
        favorite_project_ids = set()

    projects_list = []
    for project in projects:
        is_favorite = project.id in favorite_project_ids  # check if project is in the favorites
        projects_list.append({
            'id': str(project.id),
            'title': project.title,
            'imageURL': project.featured_image.url,
            'owner': {'name': project.owner.user.username},
            'vote_ratio': project.vote_ratio,
            'vote_total': project.vote_total,
            'tags': list(project.tags.values_list('name', flat=True)),
            'is_favorite': is_favorite,
            'price': str(project.price),
            'deal_link': project.deal_link  # Add this line


        })
    projects_json = json.dumps(projects_list)
    return render(request, 'projects/swipe-page.html', {'projects': projects_json})


from django.http import JsonResponse
from users.models import Favorite

def add_remove_favorite(request, pk):
    user = request.user
    project = Project.objects.get(id=pk)

    if Favorite.objects.filter(user=user, project=project).exists():
        Favorite.objects.filter(user=user, project=project).delete()
        return JsonResponse({"status": "removed"}, status=200)

    Favorite.objects.create(user=user, project=project)
    return JsonResponse({"status": "added"}, status=200)



from .models import Tag

def categories_view(request):
    tags = Tag.objects.all()
    return render(request, 'projects/categories.html', {'tags': tags})
