import { EventBus } from "./eventBus";
import state from "./store/store";

export function notifySuccess(message) {
  notify(true, message);
}

export function notifyError(message) {
  notify(false, message);
}

function notify(status, message) {
  EventBus.$emit("notify", {
    status: status,
    message: message
  });
}

export function getUserAccounts() {
  let accounts = [];
  if (state.getters.numberOfAccounts !== 0) {
    for (const key in state.getters.getAccounts) {
      if (state.getters.getAccounts[key].account.wallet !== "Issuer") {
        accounts.push(key);
      }
    }
  }

  return accounts;
}

export function getUserAccountsWithNames(exclude) {
  let accounts = [];
  const account = {
    accountId: "0.0.0",
    name: ""
  };
  accounts.push(account);
  if (state.getters.numberOfAccounts !== 0) {
    for (const key in state.getters.getAccounts) {
      if (state.getters.getAccounts[key].account.wallet !== "Issuer") {
        if (state.getters.getAccounts[key].account.wallet !== exclude) {
          const account = {
            accountId: key,
            name: state.getters.getAccounts[key].account.wallet
          };
          accounts.push(account);
        }
      }
    }
  }

  return accounts;
}

export function amountWithDecimals(amount, decimals) {
  return (amount / parseFloat(Math.pow(10, decimals))).toFixed(decimals);
}

export function getPrivateKeyForAccount(accountId) {
  return state.getters.getAccounts[accountId].account.privateKey;
}

export function getAccountDetails(account) {
  if (state.getters.numberOfAccounts !== 0) {
    for (const key in state.getters.getAccounts) {
      if (state.getters.getAccounts[key].account.wallet === account) {
        return {
          accountId: key,
          privateKey: state.getters.getAccounts[key].account.privateKey
        };
      }
    }
  }

  return {
    accountId: "",
    privateKey: ""
  };
}

export function secondsToParts(seconds) {
  const secondsInMonth = 30 * 24 * 60 * 60;
  const secondsInDay = 24 * 60 * 60;
  const secondsInHour = 60 * 60;

  const months = seconds / secondsInMonth;
  seconds = seconds % secondsInMonth;
  const days = seconds / secondsInDay;
  seconds = seconds % secondsInDay;
  const hours = seconds / secondsInHour;
  seconds = seconds % secondsInHour;
  const minutes = seconds / 60;
  seconds = seconds % 60;

  let result = months + " months ";
  if (days + hours + minutes + seconds != 0) {
    result += days + " days ";
    if (hours + minutes + seconds != 0) {
      result += hours + " hours ";
      if (minutes + seconds != 0) {
        result += minutes + " minutes ";
        if (seconds != 0) {
          result += seconds + " seconds ";
        }
      }
    }
  }
  return result;
}
