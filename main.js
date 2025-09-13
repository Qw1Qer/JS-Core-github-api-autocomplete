class View {
    constructor() {
        this.app = document.getElementById('app');
        this.title = this.createElement('h1', 'title')

        this.searchLine = this.createElement('div', 'search-line');
        this.searchInput = this.createElement('input', 'search-input');
        this.searchCounter = this.createElement('span', 'counter');
        this.searchLine.append(this.searchInput);
        this.searchLine.append(this.searchCounter);

        this.autocompleteList = this.createElement('ul', 'autocomplete-list');
        this.searchLine.append(this.autocompleteList);

        this.usersWrapper = this.createElement('div', 'users-wrapper');
        this.usersList = this.createElement('ul', 'users');
        this.usersWrapper.append(this.usersList);

        this.main = this.createElement('div', 'main');
        this.main.append(this.usersWrapper);

        this.app.append(this.title)
        this.app.append(this.searchLine);
        this.app.append(this.main);
    }

    createElement(elementTag, elementClass) {
        const element = document.createElement(elementTag)
        if(elementClass) {
            element.classList.add(elementClass)
        }
        return element;
    }

    showAutocomplete(repos) {
        this.autocompleteList.innerHTML = '';

        repos.slice(0, 5).forEach(repo => {
            const item = this.createElement('li', 'autocomplete-item');
            item.innerHTML = `
                <span class="autocomplete-name">${repo.name}</span>
            `;

            item.addEventListener('click', () => {
                this.searchInput.value = '';
                this.autocompleteList.innerHTML = '';
                this.createUser(repo);
            });

            this.autocompleteList.appendChild(item);
        });


        this.autocompleteList.style.display = 'block';
    }

    hideAutocomplete() {
        this.autocompleteList.style.display = 'none';
    }

    createUser(data) {


        const currentUsers = this.usersList.querySelectorAll('.user-prev');

        if(currentUsers.length >= 3) {
            return;
        }

        const userElement = this.createElement('li', 'user-prev');

        userElement.innerHTML = `
        <div class="user-prev-div">
        <span class='user-prev-name'>Name: ${data.name}</span>
        <span class='user-prev-owner'>Owner: ${data.owner?.login}</span>
        <span class='user-prev-stars'>Stars: ${data.stargazers_count || 0}</span> 
        </div>
        <button class='delete-button'>X</button>
    `;

        const deleteButton = userElement.querySelector('.delete-button');
        deleteButton.addEventListener('click', () => {
            userElement.remove();
        });

        this.usersList.append(userElement);
    }
}

class Search {
    constructor(view) {
        this.view = view;
        this.debounceTimeout = null;

        this.view.searchInput.addEventListener('input', this.debounce(this.searchRepos.bind(this), 400));
        this.view.searchInput.addEventListener('focus', this.handleFocus.bind(this));
        this.view.searchInput.addEventListener('blur', this.handleBlur.bind(this));

        document.addEventListener('click', (e) => {
            if (!this.view.searchLine.contains(e.target)) {
                this.view.hideAutocomplete();
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    handleFocus() {
        if (this.view.searchInput.value.trim()) {
            this.searchRepos();
        }
    }

    handleBlur() {
        setTimeout(() => this.view.hideAutocomplete(), 200);
    }

    async searchRepos() {
        const query = this.view.searchInput.value.trim();

        if (!query) {
            this.view.hideAutocomplete();
            return;
        }

        try {
            const response = await fetch(
                `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                this.view.showAutocomplete(data.items);
            } else {
                console.error('GitHub API error:', response.status);
                this.view.hideAutocomplete();
            }
        } catch (error) {
            console.error('Search error:', error);
            this.view.hideAutocomplete();
        }
    }
}

const style = document.createElement('style');
style.textContent = `
    .autocomplete-list {
        position: relative;
        top: 161px;
        left: 80px;
        background-color: #E3E3E3;
        border: 1px solid black;
        border-radius: 4px;
        height: auto;
        margin-top: 0px;
        display: none;
        width: 502px;
        z-index: 1000;
        font-size: auto;
        padding-inline-start: 0 !important
    }
    button {
       
        background-color: transparent;
        border: none;
    
    }
    .delete-button {
        
        font-size: 64px;
        color: red;
        padding-right: 20px;
    }
    .autocomplete-item {
        padding-top: 10px;
        padding-bottom: 10px;
        padding-right: 0px;
        cursor: pointer;
        border: 1px solid black;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 502px;
    }
    
    .autocomplete-item:hover {
        background-color: #65CDF9;
    }
    
    .autocomplete-name {
        font-weight: bold;
    }
    
    .autocomplete-owner {
        color: #666;
        font-size: 12px;
    }
    
    .search-line {
        position: relative;
    }
    .search-input {
        position: absolute;
        left: 80px;
        top: 100px;
        width: 500px;
        height: 61px;
        font-size: 24px;
        border: none;
        padding: 0 10px;
        box-sizing: border-box;
    }
    .users {
        position: relative;
        top: 200px;
        left: 40px;
        width: 500px;
        
    }
    .user-prev {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding-left: 10px;
        font-size: 24px;
        background-color: #E27BEB;
        border: 1px solid black;
        margin-bottom: 10px;
    }
    .user-prev-div {
        display: flex;
        flex-direction: column;
      
    }
    
    
    #app{
       background-color: #C4C4C4;
       height: 763px;
       width: 661px;
       margin: 0 auto;
    }
`;

document.head.appendChild(style);

new Search(new View());
