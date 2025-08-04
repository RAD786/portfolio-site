// Auto-close Offcanvas menu on link click
document.querySelectorAll('#offcanvasNav .nav-link').forEach(link => {
  link.addEventListener('click', () => {
    const offcanvasEl = document.getElementById('offcanvasNav');
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    bsOffcanvas.hide();
  });
});

// Load blog posts immediately
document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('posts');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  console.log('DOM loaded, attempting to fetch blog posts');
  
  // Make sure the loading indicator exists in the DOM
  if (!loadingIndicator) {
    console.error('Loading indicator element not found in the DOM');
    // Create one if it doesn't exist
    const newLoadingIndicator = document.createElement('div');
    newLoadingIndicator.id = 'loading-indicator';
    newLoadingIndicator.className = 'col-12 text-center';
    newLoadingIndicator.innerHTML = '<p>Loading blog posts...</p>';
    postsContainer.appendChild(newLoadingIndicator);
  }
  
  // Add error handling and debugging
  fetch('./posts/posts.json')
    .then(res => {
      console.log('Fetch response status:', res.status);
      if (!res.ok) {
        throw new Error(`Failed to fetch posts.json: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then(posts => {
      console.log('Loaded posts.json:', posts);
      
      if (!Array.isArray(posts) || posts.length === 0) {
        console.warn('No posts found or invalid posts format');
        
        // Add a delay before showing "No posts" message
        setTimeout(() => {
          // Find the loading indicator again in case it was added dynamically
          const indicator = document.getElementById('loading-indicator');
          if (indicator) indicator.remove();
          
          postsContainer.innerHTML = '<div class="col-12 text-center"><p>No blog posts available.</p></div>';
        }, 5000); 
        
        return;
      }
      
      // Create an array to store all post loading promises
      const postPromises = posts.map(post => {
        console.log(`Fetching post: ${post.file}`);
        return fetch(`./posts/${post.file}`)
          .then(r => {
            if (!r.ok) {
              throw new Error(`Failed to fetch ${post.file}: ${r.status} ${r.statusText}`);
            }
            return r.text();
          })
          .then(md => {
            console.log('Loaded markdown for', post.file);
            
            // Convert markdown to HTML
            let html;
            try {
              // Try different ways to use marked
              if (typeof marked === 'function') {
                html = marked(md);
              } else if (typeof marked.parse === 'function') {
                html = marked.parse(md);
              } else {
                throw new Error('Marked library has unexpected API');
              }
            } catch (e) {
              console.error('Error parsing markdown:', e);
              html = `<p>Error rendering markdown: ${e.message}</p><pre>${md}</pre>`;
            }
            
            // Return the post HTML but don't append it yet
            return {
              title: post.title,
              date: post.date,
              html: html,
              error: null
            };
          })
          .catch(err => {
            console.error(`Error loading post ${post.file}:`, err);
            // Return error information
            return {
              title: post.title,
              date: post.date,
              html: null,
              error: err.message
            };
          });
      });
      
      // Wait for all posts to be processed, then display them with a delay
      Promise.all(postPromises)
        .then(results => {
          console.log('All posts processed, adding delay before display');
          
          // Add a delay before displaying posts
          setTimeout(() => {
            // Remove loading indicator after the delay
            const indicator = document.getElementById('loading-indicator');
            if (indicator) {
              indicator.remove();
              console.log('Loading indicator removed after delay');
            } else {
              console.warn('Loading indicator not found after delay');
            }
            
            // Now append all posts to the container
            results.forEach(post => {
              const col = document.createElement('div');
              col.className = 'col-md-6';
              
              if (post.error) {
                // Display error card
                col.innerHTML = `
                  <div class="card h-100 border-danger">
                    <div class="card-body">
                      <h5 class="card-title fw-bold">${post.title}</h5>
                      <p class="text-muted small mb-3">${post.date}</p>
                      <div class="card-text text-danger">Error loading post: ${post.error}</div>
                    </div>
                  </div>`;
              } else {
                // Display normal post
                col.innerHTML = `
                  <div class="card h-100">
                    <div class="card-body">
                      <h5 class="card-title fw-bold">${post.title}</h5>
                      <p class="text-muted small mb-3">${post.date}</p>
                      <div class="card-text">${post.html}</div>
                    </div>
                  </div>`;
              }
              
              postsContainer.appendChild(col);
            });
            
            console.log('All posts displayed');
          }, 1500); // 1.5 second delay
        });
    })
    .catch(err => {
      console.error('Error loading posts:', err);
      
      // Add a delay before showing error message
      setTimeout(() => {
        // Find the loading indicator again in case it was added dynamically
        const indicator = document.getElementById('loading-indicator');
        if (indicator) indicator.remove();
        
        postsContainer.innerHTML = `<div class="col-12 text-center"><p class="text-danger">Error loading blog posts: ${err.message}</p></div>`;
      }, 1500); // 1.5 second delay
    });
});
