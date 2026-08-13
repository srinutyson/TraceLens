import requests
import time
import random
import uuid

INGEST_URL = "http://localhost:4000/api/ingest"
PROJECT_ID = "test-project-123"

def generate_realistic_trace():
    trace_id = str(uuid.uuid4())
    current_time = int(time.time() * 1000)

    spans = []
    valid_parent_ids = [] # Tracks valid IDs to build the tree

    span_types = ["retrieval", "llm_call", "tool_call", "custom"]

    span_names = [
        "Retrieve User Context", "Load Conversation History", "Fetch Customer Profile", 
        "Database Query", "Search Knowledge Base", "Retrieve Product Data", 
        "Fetch Order Details", "Load User Preferences", "Vector Database Search", 
        "Retrieve Documents", "Analyze User Intent", "Generate Response", 
        "Summarize Conversation", "Classify Request", "Generate SQL Query", 
        "Generate Support Answer", "Analyze Customer Sentiment", "Extract Entities", 
        "Rewrite Response", "Validate Generated Answer", "Call Payment Service", 
        "Call User Service", "Call Email Service", "Call Notification Service", 
        "Call Search API", "Call Recommendation API", "Call Authentication Service", 
        "Call Order Service", "Call Analytics API", "Call External API", 
        "Parse JSON Response", "Validate Input", "Format Response", "Transform Data", 
        "Calculate Score", "Apply Business Rules", "Normalize Data", "Build Context", 
        "Process Metadata", "Finalize Response"
    ]

    for i in range(50):
        span_id = str(uuid.uuid4())
        duration = random.randint(20, 1000)
        start_time = current_time
        end_time = start_time + duration
        
        base_name = span_names[i % len(span_names)]
        name = f"{base_name} #{i + 1}"
        span_type = span_types[i % len(span_types)]

        # 1. Determine Hierarchy (Nesting & Orphans)
        if i == 0:
            parent_id = None # The Root
        elif i == 15 or i == 35:
            parent_id = "broken-orphan-link-999" # Force an orphan
        else:
            # 70% chance to nest under the immediate previous span, 30% chance to attach to root
            if valid_parent_ids and random.random() > 0.3:
                parent_id = valid_parent_ids[-1]
            else:
                parent_id = valid_parent_ids[0]

        # Keep track of valid parents so we can build chains
        if i != 15 and i != 35:
            valid_parent_ids.append(span_id)

        # 2. Force Error Statuses
        status = "error" if i == 10 or i == 42 else "success"

        # 3. Inject Cost data to test the Mongoose schema fix
        cost = round(random.uniform(0.001, 0.05), 4) if span_type == "llm_call" else None

        span = {
            "traceId": trace_id,
            "spanId": span_id,
            "parentSpanId": parent_id,
            "name": name , # Ensure root gets the trace name
            "type": span_type,
            "status": status,
            "startTime": start_time,
            "endTime": end_time
        }
        
        # Only attach cost if it exists so we don't send nulls unnecessarily 
        if cost is not None:
            span["cost"] = cost

        spans.append(span)

        # Gap between spans
        gap = random.randint(5, 30)
        current_time = end_time + gap

    # Override root name cleanly
    spans[0]["name"] = "Customer Support Agent QA - 50 Spans"

    return {
        "traceId": trace_id,
        "name": spans[0]["name"],
        "startTime": spans[0]["startTime"],
        "endTime": current_time,
        "spans": spans
    }

if __name__ == "__main__":
    print("Generating nested trace with orphans and errors...")
    payload = generate_realistic_trace()
    trace_id = payload["traceId"]

    print(f"Trace ID: {trace_id}")
    print(f"Total spans: {len(payload['spans'])}\n")

    for index, span in enumerate(payload["spans"]):
        try:
            response = requests.post(
                INGEST_URL,
                json=span,
                headers={
                    "Content-Type": "application/json",
                    "x-project-id": PROJECT_ID
                }
            )

            duration = span["endTime"] - span["startTime"]
            orphan_flag = "⚠️ ORPHAN" if span["parentSpanId"] == "broken-orphan-link-999" else ""
            error_flag = "❌ ERROR" if span["status"] == "error" else ""

            print(
                f"{index + 1:02d}. "
                f"{span['name'][:25]:<25} | "
                f"Type: {span['type']:<10} | "
                f"Cost: {span.get('cost', 0):<6} | "
                f"Status: {response.status_code} {error_flag} {orphan_flag}"
            )

        except Exception as e:
            print(f"Failed to send span {index + 1}: {e}")

    print("\nFinished injecting 50 nested spans!")