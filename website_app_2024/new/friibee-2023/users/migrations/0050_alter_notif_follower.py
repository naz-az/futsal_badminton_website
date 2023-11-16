# Generated by Django 3.2.4 on 2023-11-06 10:32

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0049_auto_20231106_1823'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notif',
            name='follower',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='follower_notifications', to='users.profile'),
        ),
    ]
