from flask import Response, request
from flask_restful import Resource
from models import Bookmark, db
import json
from . import can_view_post
import flask_jwt_extended

class BookmarksListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def get(self):
        # Your code here
        bookmarks = Bookmark.query.filter_by(user_id=self.current_user.id)

        data = [
            item.to_dict() for item in bookmarks
        ]

        return Response(json.dumps(data), mimetype="application/json", status=200)

    @flask_jwt_extended.jwt_required()
    def post(self):
        body = request.get_json('post_id')
        new_post_id = body.get('post_id')
        post_id = body.get('post_id')
        user_id = self.current_user.id
        
        # check if post ID in correct format
        try: 
            post_id = int(post_id)
        except: 
            return Response(json.dumps({'message': 'Invalid post ID'}), mimetype="application/json", status=400)

        # check if post is viewable by user
        if not can_view_post(post_id, self.current_user):
            return Response(json.dumps({'message': 'Error: You do not have permission to view or bookmark this post'}), mimetype="application/json", status=404)
        
        # get the user's current bookmarks
        current_bookmarks_tuples = (
        db.session
            .query(Bookmark.post_id)
            .filter(Bookmark.user_id == self.current_user.id)
            .all()
        )

        # convert to a list of ints:
        bookmark_ids = [post_id for (post_id,) in current_bookmarks_tuples]

        # check if the specified post ID already exists in the list of user's bookmarked posts
        if new_post_id in bookmark_ids:
            return Response(json.dumps({'message': 'You already bookmarked this post.'}), mimetype="application/json", status=400)

        new_bookmark = Bookmark(user_id, post_id)
        db.session.add(new_bookmark)
        db.session.commit()
        return Response(json.dumps(new_bookmark.to_dict()), mimetype="application/json", status=201)

class BookmarkDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        # Your code here
        try:
            int(id)
        except:
            return Response(json.dumps({'message': 'Invalid post ID'}), mimetype="application/json", status=400)

        selected_bookmark = Bookmark.query.get(id)

        if not selected_bookmark or selected_bookmark.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'Error: This bookmark does not exist'}), mimetype="application/json", status=404)
        
        Bookmark.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Bookmark {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        BookmarksListEndpoint, 
        '/api/bookmarks', 
        '/api/bookmarks/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        BookmarkDetailEndpoint, 
        '/api/bookmarks/<id>', 
        '/api/bookmarks/<id>',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
