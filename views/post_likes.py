from flask import Response
import flask
from flask_restful import Resource
from models import LikePost, db
import json
from . import can_view_post
import flask_jwt_extended

class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def post(self, post_id):
        # Your code here
        user_id = self.current_user.id

        # check if post ID in in the correct format
        try: 
            post_id = int(post_id)
        except: 
            return Response(json.dumps({'message': 'Invalid post ID format.'}), mimetype="application/json", status=400)
        
        # can't like a post you can't view
        if not can_view_post(post_id, self.current_user):
            return Response(json.dumps({'message': 'Error: You do not have permission to view or like this post.'}), mimetype="application/json", status=404)

        # get the user's current likes
        current_likeposts_tuples = (
        db.session
            .query(LikePost.post_id)
            .filter(LikePost.user_id == self.current_user.id)
            .all()
        )

        # convert to a list of ints:
        likepost_ids = [post_id for (post_id,) in current_likeposts_tuples]

        # check if the specified post ID already exists in the list of user's bookmarked posts
        if post_id in likepost_ids:
            return Response(json.dumps({'message': 'You already liked this post.'}), mimetype="application/json", status=400)
        
        new_like = LikePost(user_id, post_id)
        db.session.add(new_like)
        db.session.commit()
        return Response(json.dumps(new_like.to_dict()), mimetype="application/json", status=201)

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def delete(self, post_id, id):
        # Your code here
        # check comment ID format
        try:
            int(id)
        except:
            return Response(json.dumps({'message': 'Invalid comment ID format'}), mimetype="application/json", status=400)
            
        selected_like = LikePost.query.get(id)

        # can't interact with a post you can't see
        if not can_view_post(post_id, self.current_user):
            return Response(json.dumps({'message': 'Error: You do not have permission to view this post'}), mimetype="application/json", status=404)

        # can't remove a like you didn't place
        if not selected_like or selected_like.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'Error: You do not have permission to unlike the selected post.'}), mimetype="application/json", status=404)
        
        LikePost.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Post {0} successfully unliked.'.format(post_id)
        }

        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/<post_id>/likes', 
        '/api/posts/<post_id>/likes/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/<post_id>/likes/<id>', 
        '/api/posts/<post_id>/likes/<id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
