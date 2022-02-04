from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
from . import get_authorized_user_ids
import json

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        # Your code here
        following = Following.query.filter_by(user_id = self.current_user.id).all()
        data = [
            item.to_dict_following() for item in following
        ]
        return Response(json.dumps(data), mimetype="application/json", status=200)

    def post(self):
        # Your code here
        body = request.get_json()
        cannot_follow = get_authorized_user_ids(self.current_user)

        new_following_id = body.get('user_id')
        user_id = self.current_user.id

        # check if ID is your own or someone you already follow
        if new_following_id in cannot_follow:
            return Response(json.dumps({'message': 'You already follow the selected user.'}), mimetype="application/json", status=400)

        # check if user ID in in the correct format
        try: 
            new_following_id = int(new_following_id)
        except: 
            return Response(json.dumps({'message': 'Invalid user ID format'}), mimetype="application/json", status=400)

        # check if user ID exists in database
        if User.query.get(new_following_id) == None:
            return Response(json.dumps({'message': 'Invalid user ID'}), mimetype="application/json", status=404)
        new_follow = Following(user_id, new_following_id)
        db.session.add(new_follow)
        db.session.commit()

        return Response(json.dumps(new_follow.to_dict_following()), mimetype="application/json", status=201)


class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        # Your code here
        try:
            int(id)
        except:
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=400)

        unfollow = Following.query.get(id)

        if not unfollow or unfollow.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'Error: You do not follow this user.'}), mimetype="application/json", status=404)

        unfollowed_user = unfollow.following_id

        Following.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'User {0} successfully unfollowed.'.format(unfollowed_user)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<id>', 
        '/api/following/<id>/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
