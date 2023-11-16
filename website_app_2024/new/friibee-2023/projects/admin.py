from django.contrib import admin
from .models import Project, Review, Tag, Image, Com

admin.site.register(Review)
admin.site.register(Tag)
admin.site.register(Com)


class ImageInline(admin.StackedInline):
    model = Image
    extra = 1

class ProjectAdmin(admin.ModelAdmin):
    inlines = [ImageInline]

admin.site.register(Project, ProjectAdmin)
