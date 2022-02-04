from flask import Response, request
from flask_restful import Resource
from sqlalchemy import not_
from models import User
from . import get_authorized_user_ids
import json

class SuggestionsListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        # Your code here:
        following_now = get_authorized_user_ids(self.current_user)
        not_following = User.query.filter(User.id.not_in(following_now)).limit(7)

        data = [
            item.to_dict() for item in not_following
        ]

        return Response(json.dumps(data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        SuggestionsListEndpoint, 
        '/api/suggestions', 
        '/api/suggestions/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
