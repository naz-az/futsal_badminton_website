# Generated by Django 3.2.4 on 2023-11-04 14:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0035_rename_viewers_messg_viewed_by'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='messg',
            name='viewed',
        ),
        migrations.RemoveField(
            model_name='messg',
            name='viewed_by',
        ),
    ]
