from django.db.models.base import Model
from django.forms import ModelForm, widgets
from django import forms
from .models import Project, Review, Image


class ProjectForm(ModelForm):
    image_preview = forms.ImageField(widget=forms.HiddenInput(), required=False)


    additional_image_1 = forms.ImageField(required=False)
    additional_image_2 = forms.ImageField(required=False)
    additional_image_3 = forms.ImageField(required=False)
    class Meta:
        model = Project
        fields = ['title', 'featured_image', 'description',
                  'brand', 'deal_link', 'price']
        widgets = {
            'tags': forms.CheckboxSelectMultiple(),
        }

    def __init__(self, *args, **kwargs):
        super(ProjectForm, self).__init__(*args, **kwargs)
        self.fields['image_preview'].initial = self.instance.featured_image
        for name, field in self.fields.items():
            field.widget.attrs.update({'class': 'input'})


        # self.fields['title'].widget.attrs.update(
        #     {'class': 'input'})

        # self.fields['description'].widget.attrs.update(
        #     {'class': 'input'})


# forms.py (projects)
from django.forms import ModelForm

from django import forms



# class ReviewForm(ModelForm):
#     class Meta:
#         model = Review
#         fields = ['body']

#         labels = {
#             'body': 'Add a comment'
#         }

#     def __init__(self, *args, **kwargs):
#         super(ReviewForm, self).__init__(*args, **kwargs)
#         for name, field in self.fields.items():
#             field.widget.attrs.update({'class': 'input'})


class ImageUploadForm(forms.ModelForm):
    image = forms.ImageField(widget=forms.ClearableFileInput(attrs={'multiple': True}), required=True)

    class Meta:
        model = Image
        fields = ('image',)



# class CommentForm(forms.ModelForm):
#     class Meta:
#         model = Comment
#         fields = ['content']
