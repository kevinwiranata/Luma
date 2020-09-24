package main

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

const accountObjType = "account"

// Account struct
type Account struct {
	Account string `json:"account"`
}

// AuthorizedAccounts struct
type AuthorizedAccounts struct {
	PatientID string    `json:"id"`
	Name      string    `json:"name"`
	Accounts  []Account `json:"accounts"`
}

// ToLedgerValue covnerts a []byte to JSON for ledger
func (Accounts *AuthorizedAccounts) ToLedgerValue() ([]byte, error) {
	return json.Marshal(Accounts)
}

// SaveState saves the lot struct to the ledger
func (Accounts *AuthorizedAccounts) SaveState(ctx contractapi.TransactionContextInterface) error {
	compositeKey, err := ctx.GetStub().CreateCompositeKey(accountObjType, []string{Accounts.PatientID, Accounts.Name})
	if err != nil {
		message := fmt.Sprintf("unable to create a composite key: %s", err.Error())
		return errors.New(message)
	}

	ledgerValue, err := Accounts.ToLedgerValue()
	if err != nil {
		message := fmt.Sprintf("unable to compose a ledger value: %s", err.Error())
		return errors.New(message)
	}

	return ctx.GetStub().PutState(compositeKey, ledgerValue)
}

// LoadState loads the data from the ledger into the Lot object if data is found.
// Returns false if a Lot object wasn't found in the ledger; otherwise returns true
func (Accounts *AuthorizedAccounts) LoadState(ctx contractapi.TransactionContextInterface) (bool, error) {
	compositeKey, err := ctx.GetStub().CreateCompositeKey(accountObjType, []string{Accounts.PatientID, Accounts.Name})
	if err != nil {
		message := fmt.Sprintf("unable to create a composite key: %s", err.Error())
		return false, errors.New(message)
	}

	ledgerValue, err := ctx.GetStub().GetState(compositeKey)
	if err != nil {
		message := fmt.Sprintf("unable to read the ledger value: %s", err.Error())
		return false, errors.New(message)
	}

	if ledgerValue == nil {
		return false, nil
	}

	return true, json.Unmarshal(ledgerValue, Accounts)
}
