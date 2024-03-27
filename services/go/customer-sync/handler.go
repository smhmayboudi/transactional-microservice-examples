// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"cloud.google.com/go/datastore"
	"cloud.google.com/go/logging"
)

type Customer struct {
	CustomerID string
	Credit     int
	Limit      int
}

func (a *App) Handler(w http.ResponseWriter, r *http.Request) {
	a.log.Log(logging.Entry{
		Severity: logging.Info,
		HTTPRequest: &logging.HTTPRequest{
			Request: r,
		},
		Labels:  map[string]string{"arbitraryField": "custom entry"},
		Payload: "Structured logging example.",
	})
	fmt.Fprintf(w, "Customer service / Synchronous implementation.")
}

func (a *App) Handler2(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	ctx, cancel := context.WithTimeout(ctx, time.Second)
	defer cancel()
	jsonData := make(map[string]interface{})
	err := json.NewDecoder(r.Body).Decode(&jsonData)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	customerID := ""
	invalidFields := []string{}
	for key, value := range jsonData {
		if key == "customer_id" {
			customerID = value.(string)
		} else {
			invalidFields = append(invalidFields, key)
		}
	}

	if customerID == "" {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	query := datastore.NewQuery("Customer").
		Filter("customer_id =", customerID).
		Limit(1)

	var customers []Customer
	_, err = query.GetAll(ctx, &customers)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if len(customers) == 0 {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	resp := map[string]interface{}{
		"customer_id": customers[0].CustomerID,
		"credit":      customers[0].Credit,
		"limit":       customers[0].Limit,
	}

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResp)
}

func (a *App) Handler3(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	ctx, cancel := context.WithTimeout(ctx, time.Second)
	defer cancel()
	jsonData := make(map[string]interface{})
	err := json.NewDecoder(r.Body).Decode(&jsonData)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	customerID := ""
	limit := 0
	invalidFields := []string{}
	for key, value := range jsonData {
		switch key {
		case "customer_id":
			customerID = value.(string)
		case "limit":
			limit = int(value.(float64))
		default:
			invalidFields = append(invalidFields, key)
		}
	}

	if customerID == "" || limit == 0 {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	query := datastore.NewQuery("Customer").
		Filter("customer_id =", customerID).
		Limit(1)

	var customers []Customer
	_, err = query.GetAll(ctx, &customers)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if len(customers) > 0 {
		credit := customers[0].Credit
		if limit < credit {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		customers[0].Limit = limit

		_, err = datastore.Put(ctx, "Customer", &customers[0])
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		resp := map[string]interface{}{
			"customer_id": customerID,
			"credit":      credit,
			"limit":       limit,
		}

		jsonResp, err := json.Marshal(resp)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(jsonResp)
		return
	}

	// Create a new customer entry.
	newCustomer := Customer{
		CustomerID: customerID,
		Credit:     0,
		Limit:      limit,
	}

	incompleteKey := datastore.IncompleteKey("Customer", nil)

	_, err = datastore.Put(ctx, incompleteKey, &newCustomer)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	resp := map[string]interface{}{
		"customer_id": customerID,
		"credit":      0,
		"limit":       limit,
	}

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResp)
}

func (a *App) Handler4(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	ctx, cancel := context.WithTimeout(ctx, time.Second)
	defer cancel()
	jsonData := make(map[string]interface{})
	err := json.NewDecoder(r.Body).Decode(&jsonData)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	customerID := ""
	number := 0
	invalidFields := []string{}
	for key, value := range jsonData {
		switch key {
		case "customer_id":
			customerID = value.(string)
		case "number":
			number = int(value.(float64))
		default:
			invalidFields = append(invalidFields, key)
		}
	}

	if customerID == "" || number == 0 {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	query := datastore.NewQuery("Customer").
		Filter("customer_id =", customerID).
		Limit(1)

	var customers []Customer
	_, err = query.GetAll(ctx, &customers)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if len(customers) > 0 {
		credit := customers[0].Credit
		limit := customers[0].Limit

		if credit+number*100 > limit {
			resp := map[string]interface{}{
				"customer_id": customerID,
				"credit":      credit,
				"accepted":    false,
			}

			jsonResp, err := json.Marshal(resp)
			if err != nil {
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write(jsonResp)
			return
		}

		customers[0].Credit = credit + number*100

		_, err = datastore.Put(ctx, "Customer", &customers[0])
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		resp := map[string]interface{}{
			"customer_id": customerID,
			"credit":      customers[0].Credit,
			"accepted":    true,
		}

		jsonResp, err := json.Marshal(resp)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(jsonResp)
		return
	}

	http.Error(w, "Internal Server Error", http.StatusInternalServerError)
}
