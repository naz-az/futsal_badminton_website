from .models import Project, Tag, Vote
from django.db.models import Q
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage


def paginateProjects(request, projects, results):
    page = request.GET.get('page', 1)  # Default to page 1
    paginator = Paginator(projects, results)

    try:
        projects = paginator.page(page)
    except (PageNotAnInteger, EmptyPage):
        projects = paginator.page(1)
        page = 1

    leftIndex = (int(page) - 4)
    if leftIndex < 1: leftIndex = 1

    rightIndex = (int(page) + 5)
    if rightIndex > paginator.num_pages: rightIndex = paginator.num_pages + 1

    custom_range = range(leftIndex, rightIndex)
    return custom_range, projects

from django.db.models import Count, Case, When, IntegerField, F  # Added F to the import


import re
from django.db.models import Q, Count, Case, When, IntegerField, F

# def searchProjects(request, sort_by=''):
#     search_query = request.GET.get('search_query', '')

#     tags = Tag.objects.filter(name__icontains=search_query)

#     projects = Project.objects.distinct().filter(
#         Q(title__icontains=search_query) |
#         Q(description__icontains=search_query) |
#         Q(owner__name__icontains=search_query) |
#         Q(tags__in=tags)
#     )


#     # Handle sorting by net vote count
#     if sort_by == 'upvotes':
#         projects = projects.annotate(
#             upvotes=Count(Case(When(vote__vote_type=Vote.UP, then=1)), output_field=IntegerField()),
#             downvotes=Count(Case(When(vote__vote_type=Vote.DOWN, then=1)), output_field=IntegerField())
#         ).annotate(
#             net_votes=F('upvotes') - F('downvotes')
#         ).order_by('-net_votes')
#     elif sort_by == 'created':
#         projects = projects.order_by('-created')
#     sort_order = request.GET.get('sort_order', 'desc')
#     if sort_by == 'price':
#         projects = projects.order_by(f'{"-" if sort_order == "desc" else ""}price')


#     return projects, search_query


from django.db.models import Count, Case, When, IntegerField, F

def searchProjects(request, sort_by=''):
    search_query = request.GET.get('search_query', '')
    sort_by = request.GET.get('sort_by', '')
    sort_order = request.GET.get('sort_order', 'desc')

    tags = Tag.objects.filter(name__icontains=search_query)

    projects = Project.objects.distinct().filter(
        Q(title__icontains=search_query) |
        Q(description__icontains=search_query) |
        Q(owner__name__icontains=search_query) |
        Q(tags__in=tags)
    )

    sort_order = request.GET.get('sort_order', 'desc')  # Get the sort order from the request

    # Handle sorting by net vote count
    if sort_by == 'upvotes':
        order_prefix = '' if sort_order == 'asc' else '-'
        projects = projects.annotate(
            upvotes=Count(Case(When(vote__vote_type=Vote.UP, then=1)), output_field=IntegerField()),
            downvotes=Count(Case(When(vote__vote_type=Vote.DOWN, then=1)), output_field=IntegerField())
        ).annotate(
            net_votes=F('upvotes') - F('downvotes')
        ).order_by(f'{order_prefix}net_votes')

    # Handle sorting by creation date
    elif sort_by == 'created':
        order_prefix = '' if sort_order == 'asc' else '-'
        projects = projects.order_by(f'{order_prefix}created')

    # Handle sorting by price
    elif sort_by == 'price':
        order_prefix = '' if sort_order == 'asc' else '-'
        projects = projects.order_by(f'{order_prefix}price')


    return projects, search_query
