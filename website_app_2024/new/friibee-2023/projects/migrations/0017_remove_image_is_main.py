# Generated by Django 3.2.4 on 2023-10-10 07:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0016_image_is_main'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='image',
            name='is_main',
        ),
    ]
