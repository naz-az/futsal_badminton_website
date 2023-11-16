# Generated by Django 3.2.4 on 2023-10-30 15:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0029_delete_messagereadstatus'),
    ]

    operations = [
        migrations.AddField(
            model_name='thrd',
            name='read_by_users',
            field=models.ManyToManyField(blank=True, related_name='read_threads', to='users.Profile'),
        ),
    ]
