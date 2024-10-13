import { useCallback, useEffect, useState } from "react";
import { useCustomFetch } from "src/hooks/useCustomFetch";
import { SetTransactionApprovalParams, Transaction } from "src/utils/types"; // Import Transaction type
import { TransactionPane } from "./TransactionPane";
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types";

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch();
  const [transactionApproval, setTransactionApproval] = useState<{ [id: string]: boolean }>({});

  const setTransactionApprovalFunction = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      });
      // Update local approval state
      setTransactionApproval((prev) => ({
        ...prev,
        [transactionId]: newValue,
      }));
    },
    [fetchWithoutCache]
  );

  useEffect(() => {
    if (transactions) {
      // Initialize approval states for the current transactions
      const initialApprovalState: { [id: string]: boolean } = {};
      transactions.forEach((transaction: Transaction) => { // Ensure the type is Transaction
        initialApprovalState[transaction.id] = transaction.approved; // Access approved property
      });
      setTransactionApproval(initialApprovalState);
    }
  }, [transactions]);

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>;
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          approved={transactionApproval[transaction.id]} // Pass approval state
          setTransactionApproval={setTransactionApprovalFunction}
        />
      ))}
    </div>
  );
};
