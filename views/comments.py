from flask import Response, request
from flask_restful import Resource
from . import can_view_post
import json
from models import db, Comment, Post
import flask_jwt_extended

class CommentListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def post(self):
        # Your code here
        body = request.get_json()

        text = body.get('text')
        post_id = body.get('post_id')
        user_id = self.current_user.id # id of the user who is logged in

        # check if post ID is in the correct format
        try: 
            post_id = int(post_id)
        except: 
            return Response(json.dumps({'message': 'Invalid post ID format'}), mimetype="application/json", status=400)

        # can't have a comment with no text
        if text == None:
            return Response(json.dumps({'message': 'You cannot post a comment with no text.'}), mimetype="application/json", status=400)

        # you can't comment on a post you can't see
        if not can_view_post(post_id, self.current_user):
            return Response(json.dumps({'message': 'You do not have permission to view or comment on this post'}), mimetype="application/json", status=404)
        
        # create comment:
        comment = Comment(text, user_id, post_id)
        db.session.add(comment)
        db.session.commit()
        return Response(json.dumps(comment.to_dict()), mimetype="application/json", status=201)
        
class CommentDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
  
    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        # Your code here
        # check if the comment ID is in the correct format
        try: 
            id = int(id)
        except: 
            return Response(json.dumps({'message': 'Invalid comment ID format'}), mimetype="application/json", status=400)

        # check if the comment ID exists
        if Comment.query.get(id) == None:
            return Response(json.dumps({'message': 'The selected comment does not exist'}), mimetype="application/json", status=404)

        # a user can only delete their own comment:
        comment = Comment.query.get(id)
            
        post = comment.post_id

        # check if the post ID is valid
        if Post.query.get(post) == None:
            return Response(json.dumps({'message': 'Invalid post ID.'}), mimetype="application/json", status=404)

        # you can't edit comments on a post you can't view
        if not can_view_post(post, self.current_user):
            return Response(json.dumps({'message': 'You do not have permission to interact with this post.'}), mimetype="application/json", status=404)

        # you can't edit a comment that you didn't write
        if not comment or comment.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'You do not have permission to delete this comment.'}), mimetype="application/json", status=404)
       
        Comment.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Comment {0} successfully deleted.'.format(id)
        }

        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        CommentListEndpoint, 
        '/api/comments', 
        '/api/comments/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint, 
        '/api/comments/<id>', 
        '/api/comments/<id>',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
