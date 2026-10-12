import json
import re

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import ContactMessage

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")

LIMITS = {
    "name": 120,
    "email": 254,
    "subject": 200,
    "message": 5000,
}


def _parse_body(request):
    """Accept either JSON or standard form-encoded posts."""
    content_type = request.content_type or ""
    if "application/json" in content_type:
        try:
            data = json.loads(request.body.decode("utf-8") or "{}")
            return data if isinstance(data, dict) else {}
        except (ValueError, UnicodeDecodeError):
            return {}
    return request.POST.dict()


def _clean(value):
    return (value or "").strip()


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def contact_submit(request):
    if request.method == "OPTIONS":
        # django-cors-headers fills in the CORS headers for preflight.
        return JsonResponse({}, status=200)

    data = _parse_body(request)
    fields = {
        "name": _clean(data.get("name")),
        "email": _clean(data.get("email")),
        "subject": _clean(data.get("subject")),
        "message": _clean(data.get("message")),
    }
    name = fields["name"]
    email = fields["email"]
    subject = fields["subject"]
    message = fields["message"]

    errors = {}
    if len(name) < 2:
        errors["name"] = "Please enter your name (at least 2 characters)."
    if not EMAIL_RE.match(email) or len(email) > LIMITS["email"]:
        errors["email"] = "Please enter a valid email address."
    if len(subject) < 3:
        errors["subject"] = "Please enter a subject (at least 3 characters)."
    if len(message) < 10:
        errors["message"] = "Please write a message of at least 10 characters."

    # Guard against oversized input.
    for field, limit in LIMITS.items():
        if len(fields[field]) > limit:
            errors[field] = f"{field.capitalize()} is too long."

    if errors:
        return JsonResponse({"ok": False, "errors": errors}, status=400)

    ContactMessage.objects.create(
        name=name, email=email, subject=subject, message=message
    )
    return JsonResponse(
        {"ok": True, "message": "Thanks! Your message was received."}, status=201
    )
