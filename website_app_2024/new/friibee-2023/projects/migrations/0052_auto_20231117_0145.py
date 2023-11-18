# Generated by Django 3.2.4 on 2023-11-16 17:45

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0059_profile_notify_new_upvote_on_project'),
        ('projects', '0051_project_attendees'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project',
            name='attendees',
        ),
        migrations.CreateModel(
            name='Attendance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_joined', models.DateTimeField(auto_now_add=True)),
                ('attendee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.profile')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projects.project')),
            ],
            options={
                'unique_together': {('project', 'attendee')},
            },
        ),
    ]
