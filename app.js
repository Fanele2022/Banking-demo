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
        const userIn = document.getElementById('username').value.trim();
        const passIn = document.getElementById('password').value;
        const errElement = document.getElementById('auth-error');

        if (userIn === this.defaultUser.username && passIn === this.defaultUser.password) {
            if (!localStorage.getItem(userIn)) {
                localStorage.setItem(userIn, JSON.stringify(this.defaultUser));
            }
            this.currentUser = JSON.parse(localStorage.getItem(userIn));
            localStorage.setItem('activeBankUser', userIn);
            errElement.innerText = "";
            this.renderDashboard();
        } else {
            errElement.innerText = "Invalid security credentials supplied.";
        }
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

    handleTransaction(type) {
        const input = document.getElementById('amount-input');
        const value = parseFloat(input.value);
        const errElement = document.getElementById('tx-error');
        errElement.innerText = "";

        if (isNaN(value) || value <= 0) {
            errElement.innerText = "Please specify a valid numeric transaction amount.";
            return;
        }

        if (type === 'withdraw' && value > this.currentUser.balance) {
            errElement.innerText = "Transaction Rejected: Insufficient Ledger Balance.";
            return;
        }

        if (type === 'deposit') {
            this.currentUser.balance += value;
            this.currentUser.history.push(`Deposited Funds: +R${value.toFixed(2)}`);
        } else {
            this.currentUser.balance -= value;
            this.currentUser.history.push(`Withdrew Cash: -R${value.toFixed(2)}`);
        }

        localStorage.setItem(this.currentUser.username, JSON.stringify(this.currentUser));
        this.updateUIBalances();
    }
    switchAuthMode() {
       //Temporary place holder to prevent crashes
       console.log("switchingauthentication StrictMode...");
    }
    logout() {
        localStorage.removeItem('activeBankUser');
        this.currentUser = null;
        document.getElementById('dashboard-container').classList.add('hidden');
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('username').value = "";
        document.getElementById('password').value = "";
    }
}

// Global initialization of banking module
const bankApp = new BankApplication();
