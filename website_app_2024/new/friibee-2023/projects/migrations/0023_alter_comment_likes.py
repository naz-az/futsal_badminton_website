# Generated by Django 3.2.4 on 2023-10-11 17:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0015_profile_blocked_users'),
        ('projects', '0022_comment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='likes',
            field=models.ManyToManyField(blank=True, related_name='comment_likes', to='users.Profile'),
        ),
    ]
