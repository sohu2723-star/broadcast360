Database Design

users 

id
name
email
password
role
created_at
--------------------

channels 

id
name
description
logo_url
category
status
created_at
---------------------

live_streams

id
channel_id
stream_name
stream_url
status
created_at
------------------------

videos

id
channel_id
title
description
video_url
thumbnail_url
duration
created_at
---------------------

<<<<<<< HEAD
hot news

id
channel_id
=======
news

id
>>>>>>> b85e503c3ec185806db409b9c0f1e5936e60e029
title
content
image_url
published_at
created_by
----------------------

categories

id
name (name, sport, Movies, Series)
---------------------------


