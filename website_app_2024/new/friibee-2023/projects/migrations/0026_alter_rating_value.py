# Generated by Django 3.2.4 on 2023-10-22 17:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0025_auto_20231012_0324'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rating',
            name='value',
            field=models.IntegerField(default=0),
        ),
    ]
