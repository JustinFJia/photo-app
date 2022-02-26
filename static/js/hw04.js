// build html for a single story
const story2Html = story => {
    return `
    <div class="user_story">
        <a href=""><img src="${ story.user.thumb_url }" alt="profile pic for ${ story.user.username }"/></a>
        <section> 
            <button>${ story.user.username }
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

// modal screen 
const showPostDetail = ev => {
}

// get html for a single post from posts API
const post2Html = post => {
    html = `
    <div class="card">
        <div class="card_top">
            <div class="post_heading">
                <button><h2 style="font-family: Comfortaa, sans-serif; font-size: large; font-weight: bold;">${ post.user.username }</h2></button>
                <button aria-label="more options"><i class="fas fa-ellipsis-h fa-lg"></i></button>
            </div>

            <img src="${ post.image_url }"
                alt="photo posted by ${ post.user.username }" />

            <div class="post_icons">
                <section>
                    <button aria-checked="false" aria-label="like post" onclick="likeUnlike(event)"><i class="fa${ post.current_user_like_id ? 's' : 'r' } fa-heart fa-2x"></i></button>
                    <button aria-label="add a comment"><i class="far fa-comment fa-2x"></i></button>
                    <button aria-label="share"><i class="far fa-paper-plane fa-2x"></i></button>
                </section>
                <section>
                    <button aria-label="bookmark post"><i class="fa${ post.current_user_bookmark_id ? 's' : 'r' } fa-bookmark fa-2x"></i></button>
                </section>
            </div>

            <div class="post_text">
                <div class="likes">
                    <a href="">${ post.likes.length } likes</a>
                </div>
        
                <div class="comment">
                    <a href="">${ post.user.username }</a> ${ post.caption }
                </div>
    `;

    if (post.comments.length > 1) {
        html += `
                <div class="comment">
                    <button style="text-align: left; data-post-id="${post.id}" onclick="showPostDetail(event);">
                        View all ${post.comments.length} comments
                    </button>
                </div>
        `;
    };

    if (post.comments.length > 0) {
        const lastComment = post.comments[post.comments.length-1];
        html += `
                <div class="comment">
                    <a href="">${ lastComment.user.username }</a> ${ lastComment.text }
                </div>
        `;
    };
    
    html += `

                <div class="time_posted">
                    <p style="color: rgb(80, 80, 80); text-transform: uppercase;">${ post.display_time }</p>
                </div>
            </div>

            <div class="interaction">
            <button aria-label="open emoticon picker" style="color:black;"><i class="far fa-smile fa-2x"></i></button>
            <input aria-label="add a comment" type="text" placeholder="Add a comment...">
            <button>Post</button>

        </div>
        </div>
    </div>
    `;
    return html;
};

// fetch posts from your API endpoint:
const displayPosts = () => {
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            const html = posts.map(post2Html).join('\n');
            document.querySelector('.posts').innerHTML = html;
        })
};

// get html for suggested users from suggestions API
const suggestion2Html = suggestion => {
    return `
    <div class="one_rec">
        <img src="${ suggestion.thumb_url }" alt="profile pic for ${ suggestion.username }"/>
        <div class="person">
            <a href="" style="font-size:large; text-align: left; background-color: rgb(240, 240, 240); font-weight: bold; text-decoration: none; color: black;">${ suggestion.username }</a>
            suggested for you
        </div>
        <button 
            class="follow"
            aria-label="Follow"
            aria-checked="false"
            data-user-id="${suggestion.id}" 
            onclick="toggleFollow(event);">follow</button>
    </div>
    `;
};

// draws the entire right panel
const displaySuggestions = () => {
    html = '';
    fetch('/api/profile')
        .then(response => response.json())
        .then(me => {
            html += `
            <div class="me">
                <img src="${ me.thumb_url }" alt="profile pic for ${ me.username }"/>
                <button style="font-family: Comfortaa, sans-serif; font-size: xx-large; border: none; background-color: rgb(240, 240, 240);">
                    ${ me.username }
                </button>
            </div>`;
        })
    fetch('/api/suggestions')
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

// toggle unlike and like
const likeUnlike = ev => {
    console.log('like/unlike button clicked');
    const elem = ev.currentTarget;

    if (elem.getAttribute('aria-checked') === 'false') {
        // issue post (follow) request:
        likePost(elem.dataset.postId, elem);
    } else {
        // issue delete (unfollow) request:
        unlikePost(elem.dataset.likeId, elem);
    }
};

const likePost = (postId, elem) => {
}

const unlikePost = (likeId, elem) => {
    
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
    
    fetch("https://justinphotoapp.herokuapp.com/api/following", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = 'unfollow';
            elem.setAttribute('aria-checked', 'true');
            elem.classList.add('unfollow'); 
            elem.classList.remove('follow');
            elem.setAttribute('data-following-id', data.id);
        });
};

const unfollowUser = (followingId, elem) => {
    // issue a delete request:
    // followingId = String(followingId);
    const deleteURL = `https://justinphotoapp.herokuapp.com/api/following/${followingId}`;
    fetch(deleteURL, {
            method: "DELETE"
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
    displayPosts();
    displaySuggestions();

};

// invoke init page to display stories:
initPage();