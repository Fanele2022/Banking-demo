class BankApplication {
    constructor() {
        this.currentUser = null;
        // Mock seed user data structures
        this.defaultUser = {
            username: "Rand!",
            password: "19999",
            balance: 500.00,
            history: ["Initial Opening Balance: +R500.00"]
        };
        this.initSession();
    }

    initSession() {
        const active = localStorage.getItem('activeBankUser');
        if (active) {
            this.currentUser = JSON.parse(localStorage.getItem(active));
            this.renderDashboard();
          } else {
            // This ensures the login screen is logged in yet
            document.getElementById('auth-container').classList.remove('hidden');
        }
    }

    handleAuth() {
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value.trim();
        const errElement = document.getElementById('auth-error');
        errElement.innerText = ""; 

        if (!usernameInput || !passwordInput) {
            errElement.innerText = "Please fill in all fields.";
            return;
        }

        // 1. IF SIGNING UP: Allow ANY new username!
        if (this.authMode === 'signup') {
            if (localStorage.getItem(usernameInput)) {
                errElement.innerText = "Username already taken!";
                return;
            }

            const initBalanceInput = document.getElementById('init-balance').value;
            const initialBalance = initBalanceInput ? parseFloat(initBalanceInput) : 0.00;

            const newUser = {
                username: usernameInput,
                password: passwordInput,
                balance: initialBalance,
                history: [`Account opened with initial balance: +R${initialBalance.toFixed(2)}`]
            };

            localStorage.setItem(usernameInput, JSON.stringify(newUser));
            
            this.switchAuthMode();
            errElement.innerText = "Registration successful! Please login.";
            return; // Stop running here so it doesn't fall into login logic!
        }

        // 2. IF LOGGING IN:
        const savedUserData = localStorage.getItem(usernameInput);

        // Fallback for your original user if they aren't in localStorage yet
        if (usernameInput === 'fanele' && passwordInput === '1234' && !savedUserData) {
            const defaultUser = {
                username: 'fanele',
                password: '1234',
                balance: 500.00,
                history: ['Account initialized: +R500.00']
            };
            localStorage.setItem('fanele', JSON.stringify(defaultUser));
            this.currentUser = defaultUser;
        } else if (savedUserData) {
            const user = JSON.parse(savedUserData);
            if (user.password === passwordInput) {
                this.currentUser = user;
            } else {
                errElement.innerText = "Invalid security credentials supplied.";
                return;
            }
        } else {
            errElement.innerText = "Invalid security credentials supplied.";
            return;
        }

        // Login success transition
        localStorage.setItem('activeBankUser', this.currentUser.username);
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('dashboard-container').classList.remove('hidden');
        document.getElementById('user-display').innerText = this.currentUser.username;
        document.getElementById('balance-display').innerText = "R" + this.currentUser.balance.toFixed(2);
          // ... (Inside handleAuth where login is successful)
            document.getElementById('user-display').innerText = this.currentUser.username;
            document.getElementById('balance-display').innerText = "R" + this.currentUser.balance.toFixed(2);
            
            // ADD THIS LINE: Show history when logging in!
            this.updateTransactionHistoryUI();
    }

    renderDashboard() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('dashboard-container').classList.remove('hidden');
        document.getElementById('user-display').innerText = this.currentUser.username;
        this.updateUIBalances();
    }

    updateUIBalances() {
        document.getElementById('balance-display').innerText = 'R500.00';
        const list = document.getElementById('transaction-history');
        list.innerHTML = this.currentUser.history.map(item => `<li>${item}</li>`).reverse().join('');
        document.getElementById('amount-input').value = "";
    }

 switchAuthMode() {
        const switchText = document.getElementById('auth-switch-text');
        const submitBtn = document.getElementById('primary-auth-btn');
        const toggleLink = document.getElementById('auth-toggle-link');
        const extraFields = document.getElementById('reg-extra-fields');
        
        // Initialize this.authMode if it isn't set yet
        if (!this.authMode) {
            this.authMode = 'login';
        }

        if (this.authMode === 'login') {
            this.authMode = 'signup';
            submitBtn.innerText = 'Register';
            switchText.innerText = 'Already a client? ';
            toggleLink.innerText = 'Login here';
            
            // Show the hidden initial balance field for registration!
            extraFields.classList.remove('hidden');
        } else {
            this.authMode = 'login';
            submitBtn.innerText = 'Authenticate'; // or whatever text you prefer
            switchText.innerText = 'New client? ';
            toggleLink.innerText = 'Create an account'; // or your preferred text
            
            // Hide the initial balance input box again
            extraFields.classList.add('hidden');
        }
    }


handleTransaction(type) {
        const input = document.getElementById('amount-input');
        const value = parseFloat(input.value);
        const errElement = document.getElementById('tx-error');
        errElement.innerText = "";

        if (isNaN(value) || value <= 0) {
            errElement.innerText = "Please specify a valid numeric transaction";
            return;
        }

        if (type === 'withdraw' && value > this.currentUser.balance) {
            errElement.innerText = "Transaction Rejected: Insufficient Ledger Balance";
            return;
        }

        if (type === 'deposit') {
            this.currentUser.balance += value;
            this.currentUser.history.push(`Deposited Funds: +R${value.toFixed(2)}`);
        } else {
            this.currentUser.balance -= value;
            this.currentUser.history.push(`Withdrew Cash: -R${value.toFixed(2)}`);
        }

        // This updates your screen right at the end of the transaction!
        document.getElementById('balance-display').innerText = "R" + this.currentUser.balance.toFixed(2);
          // ... (your existing transaction calculations above)
        
        // This updates your balance screen text
        document.getElementById('balance-display').innerText = "R" + this.currentUser.balance.toFixed(2);
        
        // ADD THIS LINE: This forces the screen to redraw the transaction items!
        this.updateTransactionHistoryUI();
        
        // (Optional) If you want to persist the updated balance and history to localStorage:
        localStorage.setItem(this.currentUser.username, JSON.stringify(this.currentUser));
    }
    

    logout() {
        localStorage.removeItem('activeBankUser');
        this.currentUser = null;
        document.getElementById('dashboard-container').classList.add('hidden'); // or whatever your hiding class name is
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('username').value = "";
        document.getElementById('password').value = "";
    }
 updateTransactionHistoryUI() {
        const historyContainer = document.getElementById('transaction-history-list');
        if (!historyContainer) return;

        // Clear out the old list first so it doesn't duplicate
        historyContainer.innerHTML = "";

        // Loop through the history array backward so the newest transactions are on top
        const historyList = this.currentUser.history || [];
        
        if (historyList.length === 0) {
            historyContainer.innerHTML = "<p class='empty-history'>No transactions yet.</p>";
            return;
        }

        historyList.forEach(transaction => {
            const transactionElement = document.createElement('p');
            transactionElement.className = 'transaction-item';
            transactionElement.innerText = transaction;
            historyContainer.appendChild(transactionElement);
        });
    }
}

// Global initialization of banking module
const bankApp = new BankApplication();
