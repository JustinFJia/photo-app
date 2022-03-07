// build html for a single story
const story2Html = story => {
    return `
    <div class="user_story">
        <a href="" class="normal_button"><img src="${ story.user.thumb_url }" alt="profile pic for ${ story.user.username }"/></a>
        <section> 
            <button class="normal_button">${ story.user.username }
            </button> 
        </section>
</div>
    `;
};

// fetch stories from your API endpoint:
const displayStories = () => {
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('\n');
            document.querySelector('.stories').innerHTML = html;
        })
};

// get html for suggested users from suggestions API
const suggestion2Html = suggestion => {
    return `
    <div class="one_rec">
        <img src="${ suggestion.thumb_url }" alt="profile pic for ${ suggestion.username }"/>
        <div class="person">
            <a href="" class="normal_button" style="font-size:large; text-align: left; background-color: rgb(240, 240, 240); font-weight: bold; text-decoration: none; color: black;">${ suggestion.username }</a>
            suggested for you
        </div>
        <button 
            id="normal_button"
            class="follow"
            aria-label="Follow"
            aria-checked="false"
            data-user-id="${suggestion.id}" 
            onclick="toggleFollow(event);">follow</button>
    </div>
    `;
};


const displayProfile = () => {
    let html = '';
    fetch('/api/profile')
        .then(response => response.json())
        .then(me => {
            html += `
                <img src="${ me.thumb_url }" alt="profile pic for ${ me.username }"/>
                <button class="normal_button" style="font-family: Comfortaa, sans-serif; font-size: xx-large; border: none; background-color: rgb(240, 240, 240);">
                    ${ me.username }
                </button>`;
            document.querySelector('.me').innerHTML = html;
        })
}

// draws the entire right panel
const displaySuggestions = () => {
    let html = '';
    fetch('/api/suggestions/')
        .then(response => response.json())
        .then(suggestions => {
            html += `
                <h3>
                    Suggestions for you
                </h3>`;
            html += suggestions.map(suggestion2Html).join('\n');
            document.querySelector('.others').innerHTML = html;
        })
};

// get html for a single post from posts API
const post2Html = post => {
    html = `
    <div class="card" id="post${post.id}">
        <div class="card_top">
            <div class="post_heading">
                <button class="normal_button"><h2 style="font-family: Comfortaa, sans-serif; font-size: large; font-weight: bold;">${ post.user.username }</h2></button>
                <button id="normal_button" aria-label="more post options" class="more post options"><i class="fas fa-ellipsis-h fa-lg"></i></button>
            </div>

            <img src="${ post.image_url }"
                alt="photo posted by ${ post.user.username }" />

            <div class="post_icons">
                <section>
                    <button aria-checked="${ post.current_user_like_id ? 'true' : 'false' }" 
                            class="${ post.current_user_like_id ? 'unlike post' : 'like post' }" 
                            id="normal_button"
                            aria-label="${ post.current_user_like_id ? 'Unlike post' : 'Like post' }"
                            data-post-id="${post.id}" 
                            data-like-id="${ post.current_user_like_id }"
                            data-likescount="${post.likes.length}"
                            onclick="likeUnlike(event)">
                                <i class="fa${ post.current_user_like_id ? 's' : 'r' } fa-heart fa-2x"></i>
                    </button>
                    <button id="normal_button" aria-label="add a comment" class="add comment"><i class="far fa-comment fa-2x"></i></button>
                    <button id="normal_button" aria-label="share" class="share post"><i class="far fa-paper-plane fa-2x"></i></button>
                </section>
                <section>
                    <button aria-checked="${ post.current_user_bookmark_id ? 'true' : 'false'}"
                            class="${ post.current_user_bookmark_id ? 'unbookmark post' : 'bookmark post' }"
                            id="normal_button"
                            aria-label="${ post.current_user_bookmark_id ? 'Unbookmark post' : 'Bookmark post' }"
                            data-post-id="${ post.id }"
                            data-bookmark-id="${ post.current_user_bookmark_id }"
                            onclick="bookmarkUnbookmark(event)">
                                <i class="fa${ post.current_user_bookmark_id ? 's' : 'r' } fa-bookmark fa-2x">
                                </i>
                            </button>
                </section>
            </div>

            <div class="post_text">
                <div class="like${post.id}">
    `;

    if (post.likes.length == 1) {
        html += `
            <a href="" class="normal_button">${ post.likes.length } like</a>
        </div>
        `;
    }
    else {
        html += `
            <a href="" class="normal_button">${ post.likes.length } likes</a>
        </div>
        `;
    };
    
    html += `    
                <div class="comment">
                    <a href="" class="normal_button">${ post.user.username }</a> ${ post.caption }
                </div>
    `;

    if (post.comments.length > 1) {
        html += `
                <div class="comment">
                    <button id="normal_button" class="viewall${post.id}" style="text-align: left;" data-post-id="${post.id}" onclick="showPostDetail(event);">
                        View all ${post.comments.length} comments
                    </button>
                </div>
        `;
    };

    if (post.comments.length > 0) {
        const lastComment = post.comments[post.comments.length-1];
        html += `
                <div class="comment">
                    <a href="" class="normal_button">${ lastComment.user.username }</a> ${ lastComment.text }
                </div>
        `;
    };
    
    html += `

                <div class="time_posted">
                    <p style="color: rgb(80, 80, 80); text-transform: uppercase;">${ post.display_time }</p>
                </div>
            </div>

            <form class="interaction" data-post-id="${post.id}" method="POST" action="/api/comments">
                <button class="normal_button" aria-label="open emoticon picker" style="color:black;"><i class="far fa-smile fa-2x"></i></button>
                <input type="hidden"
                        value="${post.id}"
                        name="post_id">
                <input class="normal_button" 
                        id="addcommentto${post.id}"
                        aria-label="add a comment" 
                        type="text" 
                        name="text"
                        value=""
                        placeholder="Add a comment..."
                        required="true">
                <button class="normal_button" type="submit" data-post-id="${post.id}">Post</button>
            </form>
        </div>
    </div>
    `;
    return html;
};

// fetch posts from your API endpoint:
const displayPosts = () => {
    fetch('/api/posts/', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
    },
})
        .then(response => response.json())
        .then(posts => {
            const html = posts.map(post2Html).join('\n');
            document.querySelector('.posts').innerHTML = html;
        })
};

// modal screen 
const showPostDetail = ev => {
    // const postId = ev.currentTarget.dataset.postId;
    elem = ev.currentTarget;

    var disabled_buttons = document.querySelectorAll('.normal_button');
    for (let i=0; i<disabled_buttons.length; i++) {
        disabled_buttons[i].setAttribute('tabindex', '-1');
    };

    var more_disabled_buttons = document.querySelectorAll('#normal_button');
    for (let i=0; i<more_disabled_buttons.length; i++) {
        more_disabled_buttons[i].setAttribute('tabindex', '-1');
    };
    
    fetch(`/api/posts/${elem.dataset.postId}`)
        .then(response => response.json())
        .then(post => {
            let html = '';
            html += `
                <div class="modal-bg">
                    <button onclick="destroyModal(event, ${post.id})" aria-label="close post" class="close post" class="modal_button">
                        <i class="fas fa-xmark fa-2x"></i>
                    </button>
                    <div class="modal">
                        <img src="${ post.image_url }" alt="photo posted by ${ post.user_id }"/>
                        <div class="detailed post text">
                            <div class="post creator">
                                <img src="${post.user.thumb_url}" alt="profile photo for ${post.user.username}"/>
                                <h2 style="font-family: Comfortaa, sans-serif; color=black;">${post.user.username}</h2>
                            </div>
                            <div class="scrollable text">
            `;

            if ( post.text !== null) {
                html += `
                                <div class="post comment" id="caption">
                                    <img src="${post.user.thumb_url}" alt="profile picture for ${post.user.username}"/>
                                    <div class="comment text">
                                        <a href="" class="modal_button">${ post.user.username }</a> ${ post.caption }
                                        <p>${ post.display_time }</p>
                                    </div>
                                    <button aria-label="like comment" class="like comment" class="modal_button">
                                        <i class="far fa-heart"></i>
                                    </button>
                                </div>
                `;
            };

            if ( post.comments.length > 0) {
                html += `${ displayAllComments(post.comments)}`;
            };

            html += `       </div>
                        </div>
                    </div>
                </div>`;
            document.querySelector('#modal-container').innerHTML = html;
            document.querySelector
            document.body.style.overflowY = 'hidden';
            document.querySelector('.close.post').focus();
        });
}

const displayAllComments = comments => {
    let html = '';
    for (let i=0; i<comments.length; i++) {
        current_comment = comments[i]
        html += `
        <div class="post comment">
            <img src="${current_comment.user.thumb_url}" alt="profile picture for ${current_comment.user.username}"/>
            <div class="comment text">
                <a href="" class="modal_button">${ current_comment.user.username }</a> ${ current_comment.text }
                <p>${current_comment.timestamp}</p>
            </div>
            <button aria-label="like comment" class="like comment" class="modal_button">
                <i class="far fa-heart"></i>
            </button>
        </div>
        `;
    };
    return html;
}

const destroyModal = (ev, postID) => {
    document.querySelector('#modal-container').innerHTML = "";
    document.body.style.overflowY = 'auto';

    var disabled_buttons = document.querySelectorAll('.normal_button');
    for (let i=0; i<disabled_buttons.length; i++) {
        disabled_buttons[i].removeAttribute('tabindex');
   };

   var more_disabled_buttons = document.querySelectorAll('#normal_button');
   for (let i=0; i<more_disabled_buttons.length; i++) {
        more_disabled_buttons[i].removeAttribute('tabindex');
   };

   document.querySelector(`.viewall${postID}`).focus();
};

// toggle unlike and like
const likeUnlike = ev => {
    console.log('like/unlike button clicked');
    const elem = ev.currentTarget;

    if (elem.getAttribute('aria-checked') === 'false') {
        // issue post (follow) request:
        // need the post id to create the like
        likePost(elem.dataset.postId, elem);
    } else {
        // issue delete (unfollow) request:
        // need the like ID to delete the like
        unlikePost(elem);
    }
};

const likePost = (postId, elem) => {
    const postData = {};

    likes_count = elem.dataset.likescount;
    likes_count = parseInt(likes_count);
    likes_count += 1;
    
    if (likes_count == 1) {
        document.querySelector(`.like${postId}`).innerHTML = `<a href="">${ likes_count } like</a>`;
    }
    else {
        document.querySelector(`.like${postId}`).innerHTML = `<a href="">${ likes_count } likes</a>`;
    };

    fetch(`/api/posts/${postId}/likes`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.setAttribute('aria-checked', 'true');
        elem.setAttribute('aria-label', 'Unlike post')
        elem.classList.add('unlike-post'); 
        elem.classList.remove('like-post');
        elem.setAttribute('data-like-id', data.id);
        elem.setAttribute('data-likescount', likes_count);
        elem.innerHTML = `
        <i class="fas fa-heart fa-2x"></i>
        `;
    });
}

const unlikePost = (elem) => {
    likes_count = elem.dataset.likescount;
    likes_count = parseInt(likes_count);
    likes_count -= 1;
    
    if (likes_count == 1) {
        document.querySelector(`.like${elem.dataset.postId}`).innerHTML = `<a href="">${ likes_count } like</a>`;
    }
    else {
        document.querySelector(`.like${elem.dataset.postId}`).innerHTML = `<a href="">${ likes_count } likes</a>`;
    };

    const deleteURL = `/api/posts/${elem.dataset.postId}/likes/${elem.dataset.likeId}`;
    fetch(deleteURL, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.setAttribute('aria-checked', 'false');
        elem.setAttribute('aria-label', 'Like post')
        elem.classList.remove('unlike-post');
        elem.classList.add('like-post');
        elem.removeAttribute('data-likepost-id');
        elem.setAttribute('data-likescount', likes_count);
        elem.innerHTML = `
        <i class="far fa-heart fa-2x"></i>
        `;
    });
}

const bookmarkUnbookmark = ev => {
    console.log('bookmark/unbookmark button clicked');
    const elem = ev.currentTarget;

    if (elem.getAttribute('aria-checked') === 'false') {
        // issue post (follow) request:
        // need the post id to create the like
        bookmarkPost(elem.dataset.postId, elem);
    } else {
        // issue delete (unfollow) request:
        // need the like ID to delete the like
        unbookmarkPost(elem);
    }
};

const bookmarkPost = (postId, elem) => {
    const postData = {
        'post_id': postId
    };

    fetch("/api/bookmarks/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.setAttribute('aria-checked', 'true');
        elem.setAttribute('aria-label', 'Unbookmark post')
        elem.classList.add('unbookmark-post'); 
        elem.classList.remove('bookmark-post');
        elem.setAttribute('data-bookmark-id', data.id);
        elem.innerHTML = `
        <i class="fas fa-bookmark fa-2x"></i>
        `;
    });
}

const unbookmarkPost = (elem) => {
    const deleteURL = `/api/bookmarks/${elem.dataset.bookmarkId}`;
    fetch(deleteURL, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.setAttribute('aria-checked', 'false');
        elem.setAttribute('aria-label', 'Bookmark post')
        elem.classList.remove('unbookmark-post');
        elem.classList.add('bookmark-post');
        elem.removeAttribute('data-bookmark-id');
        elem.innerHTML = `
        <i class="far fa-bookmark fa-2x"></i>
        `;
    });
}


const toggleFollow = ev => {
    const elem = ev.currentTarget;

    if (elem.getAttribute('aria-checked') === 'false') {
        // issue post (follow) request:
        followUser(elem.dataset.userId, elem);
    } else {
        // issue delete (unfollow) request:
        unfollowUser(elem.dataset.followingId, elem);
    }
};

const followUser = (userId, elem) => {
    const postData = {
        "user_id": userId
    };
    
    fetch("/api/following", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = 'following';
            elem.setAttribute('aria-checked', 'true');
            elem.classList.add('unfollow'); 
            elem.classList.remove('follow');
            elem.setAttribute('data-following-id', data.id);
        });
};

const unfollowUser = (followingId, elem) => {
    // issue a delete request:
    // followingId = String(followingId);
    const deleteURL = `/api/following/${followingId}`;
    fetch(deleteURL, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = 'follow';
            elem.classList.add('follow');
            elem.classList.remove('unfollow');
            elem.removeAttribute('data-following-id');
            elem.setAttribute('aria-checked', 'false');
        });
};


const initPage = () => {
    displayStories();
    displayProfile();
    displaySuggestions();
    displayPosts();
};

const getCookie = key => {
    let name = key + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

// invoke init page to display stories:
initPage();