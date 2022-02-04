from flask import Response, request
from flask_restful import Resource
from . import can_view_post
import json
from models import db, Comment, Post

class CommentListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def post(self):
        # Your code here
        body = request.get_json()

        text = body.get('text')
        post_id = body.get('post_id')
        user_id = self.current_user.id # id of the user who is logged in

        # check if text exists
        if text == None:
             return Response(json.dumps({'message': 'You cannot post a comment with no text'}), mimetype="application/json", status=400)

       # check if post ID in in the correct format
        try: 
            post_id = int(post_id)
        except: 
            return Response(json.dumps({'message': 'Invalid post ID format'}), mimetype="application/json", status=400)

        if not can_view_post(post_id, self.current_user):
            return Response(json.dumps({'message': 'Error: You do not have permission to view or comment on this post'}), mimetype="application/json", status=404)
        
        # create comment:
        comment = Comment(text, user_id, post_id)
        db.session.add(comment)
        db.session.commit()
        return Response(json.dumps(comment.to_dict()), mimetype="application/json", status=201)
        
class CommentDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
  
    def delete(self, id):
        # Your code here
        # a user can only delete their own comment:
        try:
            int(id)
        except:
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=400)
            
        # check if comment ID exists
        if Comment.query.get(id) == None:
            return Response(json.dumps({'message': 'Comment does not exist'}), mimetype="application/json", status=404)

        # user can only delete their own comment
        comment = Comment.query.get(id)

        post = comment.post_id

        # check if post ID works
        if Post.query.get(post)==None:
            return Response(json.dumps({'message': 'Error: Invalid Post ID'}), mimetype="application/json", status=404)

        if not can_view_post(post, self.current_user):
            return Response(json.dumps({'message': 'Error: You do not have permission to interact with this post'}), mimetype="application/json", status=404)

        if not comment or comment.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'Error: You do not have permission to delete this comment or this comment does not exist'}), mimetype="application/json", status=404)
       
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
        resource_class_kwargs={'current_user': api.app.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint, 
        '/api/comments/<id>', 
        '/api/comments/<id>',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
