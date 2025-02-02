# Generated by Django 3.2.4 on 2023-10-29 16:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0027_alter_messg_thread'),
        ('projects', '0032_auto_20231029_2057'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='project',
            options={'ordering': ['title']},
        ),
        migrations.RemoveField(
            model_name='project',
            name='vote_ratio',
        ),
        migrations.RemoveField(
            model_name='project',
            name='vote_total',
        ),
        migrations.RemoveField(
            model_name='vote',
            name='vote',
        ),
        migrations.AddField(
            model_name='vote',
            name='vote_type',
            field=models.CharField(choices=[('up', 'Upvote'), ('down', 'Downvote')], max_length=4, null=True),
        ),
        migrations.AlterField(
            model_name='vote',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.profile'),
        ),
        migrations.DeleteModel(
            name='Rating',
        ),
    ]
