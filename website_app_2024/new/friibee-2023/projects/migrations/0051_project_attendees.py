# Generated by Django 3.2.4 on 2023-11-16 17:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0059_profile_notify_new_upvote_on_project'),
        ('projects', '0050_auto_20231117_0033'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='attendees',
            field=models.ManyToManyField(blank=True, related_name='attended_projects', to='users.Profile'),
        ),
    ]
