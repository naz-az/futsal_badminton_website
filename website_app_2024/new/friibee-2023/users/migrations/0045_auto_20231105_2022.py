# Generated by Django 3.2.4 on 2023-11-05 12:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0044_delete_null_user_notis'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notif',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('read', models.BooleanField(default=False)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('follower', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='follower_notifications', to='users.profile')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_notifications', to='users.profile')),
            ],
        ),
        migrations.DeleteModel(
            name='Noti',
        ),
    ]
