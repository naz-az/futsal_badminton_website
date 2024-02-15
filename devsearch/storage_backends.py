from storages.backends.s3boto3 import S3Boto3Storage

class B2MediaStorage(S3Boto3Storage):
    location = 'media'  # Or any path prefix you want to use
    file_overwrite = False
    custom_domain = False
