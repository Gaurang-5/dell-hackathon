#!/usr/bin/env python3
"""Generate a realistic IT device management dataset."""

import datetime
import json
import os
import random
import unicodedata
from faker import Faker

# Use Indian locale for realistic Indian enterprise names
faker = Faker("en_IN")
random.seed(42)
faker.seed_instance(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(BASE_DIR, "..", "public", "data")
os.makedirs(OUT_DIR, exist_ok=True)

NOW = datetime.datetime(2024, 6, 21, 9, 30, 0)

DEPARTMENTS = [
    "Finance",
    "Engineering",
    "HR",
    "Legal",
    "Operations",
    "IT",
    "Sales",
    "Marketing",
]

OS_OPTIONS = [
    "Windows 11 Pro",
    "Windows 10 Enterprise",
    "macOS 13.6",
    "macOS 14.1",
    "Ubuntu 22.04 LTS",
    "iOS 17.1",
    "Android 13",
]

OS_BY_TYPE = {
    "LAPTOP": [
        "Windows 11 Pro",
        "Windows 10 Enterprise",
        "macOS 13.6",
        "macOS 14.1",
        "Ubuntu 22.04 LTS",
    ],
    "SERVER": ["Ubuntu 22.04 LTS", "Windows 11 Pro"],
    "WORKSTATION": [
        "Windows 11 Pro",
        "Windows 10 Enterprise",
        "Ubuntu 22.04 LTS",
    ],
    "MOBILE": ["iOS 17.1", "Android 13"],
}

FLEET_SEGMENTS = ["corporate", "field", "remote", "contractor"]
FLEET_WEIGHTS = [60, 12, 20, 8]

ANTIVIRUS_STATUSES = ["active", "outdated", "missing"]
AV_WEIGHTS = [70, 20, 10]

MODELS = {
    "LAPTOP": [
        "ThinkPad-L14",
        "ThinkPad-L15",
        "Latitude-5430",
        "MacBook-Pro-14",
        "MacBook-Air-13",
        "EliteBook-840",
    ],
    "SERVER": [
        "PowerEdge-R740",
        "ProLiant-DL380",
        "ThinkSystem-SR650",
        "PowerEdge-R750",
    ],
    "WORKSTATION": [
        "Precision-3660",
        "Z4-G4",
        "ThinkStation-P360",
        "Mac-Studio",
    ],
    "MOBILE": [
        "iPhone-13",
        "iPhone-14",
        "Galaxy-S22",
        "Galaxy-S23",
        "Pixel-7",
    ],
}

TYPE_COUNTS = {
    "LAPTOP": 20,
    "SERVER": 10,
    "WORKSTATION": 10,
    "MOBILE": 10,
}

EVENT_TYPES = [
    "suspicious_process",
    "failed_login_burst",
    "policy_violation",
    "unauthorized_usb",
    "anomalous_traffic",
    "patch_overdue_critical",
    "config_drift",
]

SUSPICIOUS_PROCESSES = [
    "svchost32.exe",
    "updatemgr.exe",
    "syshelper.exe",
    "winlogon64.exe",
    "taskhostw2.exe",
    "explorer2.exe",
    "mshtacalc.exe",
    "powershell2.exe",
]


def to_ascii(s):
    """Convert a string to plain ASCII for usernames and hostnames."""
    return (
        unicodedata.normalize("NFKD", s)
        .encode("ascii", "ignore")
        .decode("ascii")
        .lower()
        .replace(" ", "")
    )


def rand_past_datetime(max_days, min_days=0):
    """Return a random ISO datetime within the last N days."""
    delta = random.uniform(min_days, max_days)
    dt = NOW - datetime.timedelta(days=delta)
    # Round to nearest minute for cleanliness
    dt = dt.replace(second=0, microsecond=0)
    return dt


def make_devices():
    """Generate the devices.json dataset."""
    compliance_categories = (
        ["compliant"] * 30 + ["partial"] * 12 + ["non_compliant"] * 8
    )
    random.shuffle(compliance_categories)

    devices = []
    idx = 0
    for device_type, count in TYPE_COUNTS.items():
        for n in range(1, count + 1):
            comp = compliance_categories[idx]
            idx += 1

            if comp == "compliant":
                patch_pct = round(random.uniform(0.92, 1.0), 2)
                patch_offset = random.uniform(1, 14)
            elif comp == "partial":
                patch_pct = round(random.uniform(0.65, 0.89), 2)
                patch_offset = random.uniform(15, 45)
            else:
                patch_pct = round(random.uniform(0.15, 0.59), 2)
                patch_offset = random.uniform(46, 90)

            first = to_ascii(faker.first_name())
            last = to_ascii(faker.last_name())
            assigned_user = f"{first}.{last}" if last else f"{first}{random.randint(1, 99)}"

            model = random.choice(MODELS[device_type])
            device_name = f"{first.title()}-{model}"
            os_name = random.choice(OS_BY_TYPE[device_type])

            last_seen_dt = rand_past_datetime(30)
            last_patch_dt = last_seen_dt - datetime.timedelta(days=patch_offset)

            device = {
                "device_id": f"{device_type}-{n:04d}",
                "device_name": device_name,
                "os": os_name,
                "department": random.choice(DEPARTMENTS),
                "assigned_user": assigned_user,
                "last_seen": last_seen_dt.isoformat(),
                "patch_compliance_pct": patch_pct,
                "disk_usage_pct": round(random.uniform(0.25, 0.95), 2),
                "ram_usage_pct": round(random.uniform(0.20, 0.92), 2),
                "cpu_avg_7d": round(random.uniform(0.10, 0.85), 2),
                "is_encrypted": random.random() < 0.75,
                "last_patch_date": last_patch_dt.date().isoformat(),
                "antivirus_status": random.choices(
                    ANTIVIRUS_STATUSES, weights=AV_WEIGHTS, k=1
                )[0],
                "fleet_segment": random.choices(
                    FLEET_SEGMENTS, weights=FLEET_WEIGHTS, k=1
                )[0],
            }
            devices.append(device)

    return devices


def event_description(event_type, process_name=None):
    """Return a one-sentence, manager-friendly description for a security event."""
    templates = {
        "suspicious_process": (
            "An unfamiliar program was observed repeatedly trying to access protected system settings on this device."
        ),
        "failed_login_burst": (
            "Someone tried to log in to this device many times in a short period with the wrong password, which looks like a password-guessing attempt."
        ),
        "policy_violation": (
            "This device was used to visit a website or run software that violates the company security policy."
        ),
        "unauthorized_usb": (
            "A USB device that is not on the approved list was plugged into this machine."
        ),
        "anomalous_traffic": (
            "This device sent an unusually large amount of data to an internet address it has never contacted before."
        ),
        "patch_overdue_critical": (
            "This device has not received important security updates that were released more than 30 days ago."
        ),
        "config_drift": (
            "Settings on this device changed in a way that does not match the company standard configuration."
        ),
    }
    desc = templates[event_type]
    if event_type == "suspicious_process" and process_name:
        desc = desc.replace(
            "An unfamiliar program",
            f"The program {process_name}",
        )
    return desc


def resolution_action(event_type):
    """Return a plain-English resolution action."""
    actions = {
        "suspicious_process": "Investigated and removed the suspicious program, then ran a full scan.",
        "failed_login_burst": "Reset the user password and notified them to enable stronger sign-in protection.",
        "policy_violation": "Blocked the offending site or application and reminded the user of the policy.",
        "unauthorized_usb": "Removed the unapproved USB device and updated the device control rules.",
        "anomalous_traffic": "Isolated the device from the network until the traffic source could be reviewed.",
        "patch_overdue_critical": "Installed the missing security updates and confirmed the device is now current.",
        "config_drift": "Re-applied the standard company settings and verified compliance.",
    }
    return actions.get(event_type, "Reviewed and resolved the alert.")


def make_security_events(devices):
    """Generate the security_events.json dataset."""
    severities = (
        ["critical"] * 15 + ["high"] * 60 + ["medium"] * 125
    )
    random.shuffle(severities)

    events = []
    for i, sev in enumerate(severities, start=1):
        event_type = random.choice(EVENT_TYPES)
        device = random.choice(devices)
        process_name = (
            random.choice(SUSPICIOUS_PROCESSES)
            if event_type == "suspicious_process"
            else None
        )
        events.append(
            {
                "event_id": f"EVT-{i:05d}",
                "timestamp": rand_past_datetime(30).isoformat(),
                "device_id": device["device_id"],
                "device_name": device["device_name"],
                "event_type": event_type,
                "severity": sev,
                "plain_description": event_description(event_type, process_name),
                "process_name": process_name,
                "resolved": False,
                "resolution_action": None,
            }
        )

    # Mark exactly 35 events as resolved
    resolved_indices = random.sample(range(len(events)), 35)
    for idx in resolved_indices:
        events[idx]["resolved"] = True
        events[idx]["resolution_action"] = resolution_action(events[idx]["event_type"])

    return events


def confidence_label(status):
    return {"High Confidence": "High", "Medium": "Medium", "Review Recommended": "Review"}[status]


def confidence_score(status):
    if status == "High Confidence":
        return f"{random.uniform(0.85, 0.99):.2f}"
    if status == "Medium":
        return f"{random.uniform(0.60, 0.84):.2f}"
    return f"{random.uniform(0.40, 0.59):.2f}"


RECOMMENDATION_TEMPLATES = {
    "SECURITY_FLAG": {
        "title": "{assetId} ({device_name}): Critical Patch Missing",
        "summary": "This device is missing {count} security patches released in the last 30 days. Two of them fix vulnerabilities that attackers are actively using right now.",
        "data_sources": [
            "Windows Update patch history for this device (last 90 days)",
            "Microsoft Security Bulletin database — June 2024",
            "Patch compliance records across {fleet_count} similar {os_name} devices in your fleet",
        ],
        "known_limitations": "This recommendation assumes the device has a stable internet connection for patch download. Devices on metered or VPN-only connections may need a different deployment method.",
        "reasoning": [
            (
                "We checked this device's update history and found {count} patches missing that were released between May 15 and June 10, 2024.",
                "Two of these patches fix security gaps that real attackers are currently exploiting. Devices missing these patches are far more likely to be compromised based on your fleet's own incident history over the past year.",
                "Applying all {count} patches now brings this device back to full compliance and removes the known risk. The update takes approximately {minutes} minutes and requires one restart.",
            ),
        ],
        "options": [
            {
                "name": "Option A",
                "title": "Option A: Apply all patches now",
                "description": "Push all {count} missing patches immediately during the next maintenance window. Device will restart once. Estimated downtime: {minutes} minutes.",
                "confidence": "Confidence: High",
                "badgeColor": "tertiary",
                "actionLabel": "Apply Patches Now",
            },
            {
                "name": "Option B",
                "title": "Option B: Schedule for tonight",
                "description": "Queue the patch deployment for 11 PM tonight when the device is less likely to be in active use. Risk remains elevated until then.",
                "confidence": "Confidence: Medium",
                "badgeColor": "error",
                "actionLabel": "Schedule for Tonight",
            },
        ],
    },
    "MAINTENANCE_REQ": {
        "title": "{assetId} ({device_name}): Storage Health Warning",
        "summary": "This device is running low on free disk space, which can slow down work and prevent important updates from installing correctly.",
        "data_sources": [
            "Disk usage telemetry for this device over the past 60 days",
            "Fleet maintenance records covering {fleet_count} similar {device_type} devices",
            "Support ticket history from the last 12 months",
        ],
        "known_limitations": "The cleanup estimate assumes typical user files and cached data. Devices with very large project files may need manual review before automatic cleanup.",
        "reasoning": [
            (
                "We found that this device's main drive is more than {pct}% full, leaving little room for updates or temporary files.",
                "When disk space drops this low, systems become slow and security updates can fail. Similar devices in your fleet with the same issue generated twice as many support tickets.",
                "We recommend running an automated cleanup to remove old temporary files and cached data, which should free enough space and restore normal performance.",
            ),
        ],
        "options": [
            {
                "name": "Option A",
                "title": "Option A: Run cleanup now",
                "description": "Start the automated cleanup tool immediately to remove temporary and cached files. No restart is required.",
                "confidence": "Confidence: High",
                "badgeColor": "tertiary",
                "actionLabel": "Run Cleanup Now",
            },
            {
                "name": "Option B",
                "title": "Option B: Ask user to free space",
                "description": "Send a polite request to the assigned user to move personal files to cloud storage before the cleanup runs.",
                "confidence": "Confidence: Medium",
                "badgeColor": "error",
                "actionLabel": "Notify User",
            },
        ],
    },
    "FIRMWARE_ALERT": {
        "title": "{assetId} ({device_name}): Firmware Update Available",
        "summary": "The firmware that runs this device's hardware is out of date and the manufacturer has released a newer version that fixes known stability and security issues.",
        "data_sources": [
            "BIOS/UEFI version reported by this device",
            "Manufacturer firmware release notes for model {model}",
            "Firmware version comparison across {fleet_count} similar devices",
        ],
        "known_limitations": "Firmware updates require the device to stay powered and connected throughout the process. Laptops must be plugged into power to avoid interruption.",
        "reasoning": [
            (
                "This device is running firmware version {version}, while the manufacturer's latest tested release is {new_version}.",
                "The newer firmware fixes problems that can cause unexpected crashes and weakens protections that keep the device secure at startup.",
                "We recommend scheduling the firmware update during the next maintenance window because it closes those gaps and improves hardware reliability.",
            ),
        ],
        "options": [
            {
                "name": "Option A",
                "title": "Option A: Update firmware now",
                "description": "Apply the firmware update immediately. The device will reboot once and should be ready within a few minutes.",
                "confidence": "Confidence: High",
                "badgeColor": "tertiary",
                "actionLabel": "Update Firmware Now",
            },
            {
                "name": "Option B",
                "title": "Option B: Schedule for next maintenance window",
                "description": "Queue the firmware update for the next planned maintenance window. The device remains on the older firmware until then.",
                "confidence": "Confidence: Medium",
                "badgeColor": "error",
                "actionLabel": "Schedule Update",
            },
        ],
    },
    "CALIBRATION_REQ": {
        "title": "{assetId} ({device_name}): Battery Calibration Needed",
        "summary": "This mobile device's battery reporting has become inaccurate, causing it to shut down unexpectedly even when the screen shows remaining charge.",
        "data_sources": [
            "Battery calibration readings from the past 30 days",
            "Power management logs across {fleet_count} mobile devices",
            "Manufacturer calibration guidelines",
        ],
        "known_limitations": "Battery calibration works best when the user can leave the device undisturbed for several hours. Active travel schedules may delay the process.",
        "reasoning": [
            (
                "We noticed that the reported battery level changes suddenly and does not match the actual charge remaining.",
                "An uncalibrated battery can cause sudden shutdowns and reduced productivity for users who rely on the device away from their desk.",
                "We recommend performing a full charge and discharge cycle to recalibrate the battery gauge, which should restore accurate reporting.",
            ),
        ],
        "options": [
            {
                "name": "Option A",
                "title": "Option A: Start calibration today",
                "description": "Send instructions to the user to fully drain and recharge the battery today. No replacement parts are needed.",
                "confidence": "Confidence: High",
                "badgeColor": "tertiary",
                "actionLabel": "Start Calibration",
            },
            {
                "name": "Option B",
                "title": "Option B: Replace battery instead",
                "description": "Arrange for a battery replacement if the device is still under warranty or if calibration has failed before.",
                "confidence": "Confidence: Medium",
                "badgeColor": "error",
                "actionLabel": "Request Replacement",
            },
        ],
    },
}


def make_recommendations(devices):
    """Generate the ai_recommendations.json dataset."""
    categories = (
        ["SECURITY_FLAG"] * 8 + ["MAINTENANCE_REQ"] * 5 + ["FIRMWARE_ALERT"] * 4 + ["CALIBRATION_REQ"] * 3
    )
    statuses = (
        ["High Confidence"] * 8 + ["Medium"] * 7 + ["Review Recommended"] * 5
    )
    random.shuffle(categories)
    random.shuffle(statuses)

    recommendations = []
    for i in range(1, 21):
        category = categories[i - 1]
        status = statuses[i - 1]
        device = random.choice(devices)
        template = RECOMMENDATION_TEMPLATES[category]

        # Deterministic-looking values for this recommendation
        count = random.randint(2, 5)
        minutes = random.choice([10, 12, 15, 20])
        pct = random.randint(78, 94)
        version = random.choice(["1.12", "2.04", "1.08", "3.01"])
        new_version = random.choice(["1.15", "2.07", "1.11", "3.04"])
        fleet_count = random.choice(["1,742", "1,856", "1,903", "1,647", "1,815"])
        os_name = device["os"]
        device_type = device["device_id"].split("-")[0].title()
        model = device["device_name"].split("-", 1)[1]

        fmt = {
            "assetId": device["device_id"],
            "device_name": device["device_name"],
            "count": count,
            "minutes": minutes,
            "pct": pct,
            "version": version,
            "new_version": new_version,
            "fleet_count": fleet_count,
            "os_name": os_name,
            "device_type": device_type,
            "model": model,
        }

        reasoning_tuple = random.choice(template["reasoning"])
        reasoning_steps = [
            {
                "stepNum": f"{step:02d}",
                "label": label,
                "detail": reasoning_tuple[step - 1].format(**fmt),
            }
            for step, label in enumerate(["What we found", "Why it matters", "What we recommend"], start=1)
        ]

        options = [
            {
                "name": opt["name"],
                "title": opt["title"].format(**fmt),
                "description": opt["description"].format(**fmt),
                "confidence": opt["confidence"],
                "badgeColor": opt["badgeColor"],
                "actionLabel": opt["actionLabel"],
            }
            for opt in template["options"]
        ]

        rec = {
            "id": f"rec-{i:03d}",
            "title": template["title"].format(**fmt),
            "summary": template["summary"].format(**fmt),
            "assetId": device["device_id"],
            "createdAt": rand_past_datetime(14).isoformat(),
            "status": status,
            "category": category,
            "confidenceScore": confidence_score(status),
            "confidenceLabel": confidence_label(status),
            "dataSources": [s.format(**fmt) for s in template["data_sources"]],
            "knownLimitations": template["known_limitations"],
            "reasoningSteps": reasoning_steps,
            "options": options,
        }
        recommendations.append(rec)

    return recommendations


def asset_icon(device_type):
    mapping = {
        "LAPTOP": "laptop",
        "SERVER": "server",
        "WORKSTATION": "monitor",
        "MOBILE": "smartphone",
    }
    return mapping.get(device_type, "settings")


AUDIT_ACTIONS = [
    "Applied missing security patches",
    "Restarted endpoint protection service",
    "Removed unauthorized software",
    "Re-imaged device after malware alert",
    "Blocked a policy-violating website",
    "Approved a firmware update",
    "Reset user password after login alerts",
    "Isolated device from the network",
    "Ran a full system scan",
    "Restored standard device settings",
]

AUDIT_REASONINGS = {
    "Approved": [
        "The risk was clear and the recommended action matched company policy, so approval was appropriate.",
        "Evidence showed an active security issue, and the proposed fix was low impact for the user.",
        "The device was well outside compliance and the suggested change was standard practice.",
    ],
    "Overridden": [
        "The user is on a critical sales call, so the action was postponed until the evening.",
        "A scheduled system maintenance window is already planned, making immediate action unnecessary.",
        "The device is a lab test machine and the alert was deemed a false positive by the team.",
    ],
    "Escalated": [
        "The event pattern matches a known attack method, so the security team needs to investigate further.",
        "Multiple devices showed the same behavior, suggesting a wider issue that requires specialist review.",
        "The impact on business operations was unclear, so senior staff were asked to decide the next step.",
    ],
}


def make_audit_log(devices):
    """Generate the audit_log.json dataset."""
    decisions = ["Approved"] * 15 + ["Overridden"] * 8 + ["Escalated"] * 7
    random.shuffle(decisions)

    logs = []
    for i in range(1, 31):
        decision = decisions[i - 1]
        device = random.choice(devices)
        dt = rand_past_datetime(14)
        confidence = random.choice(["HIGH", "MEDIUM", "REVIEW"])
        logs.append(
            {
                "id": f"log-{i:03d}",
                "timestamp": dt.strftime("%Y-%m-%d %H:%M"),
                "assetId": device["device_id"],
                "assetIcon": asset_icon(device["device_id"].split("-")[0]),
                "actionTaken": random.choice(AUDIT_ACTIONS),
                "reasoningSummary": random.choice(AUDIT_REASONINGS[decision]),
                "confidence": confidence,
                "humanDecision": decision,
                "sourceMatrix": None,
            }
        )

    return logs


def write_json(filename, data):
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return path


def main():
    devices = make_devices()
    security_events = make_security_events(devices)
    recommendations = make_recommendations(devices)
    audit_log = make_audit_log(devices)

    write_json("devices.json", devices)
    write_json("security_events.json", security_events)
    write_json("ai_recommendations.json", recommendations)
    write_json("audit_log.json", audit_log)

    print(
        f"Generated: devices.json ({len(devices)}), "
        f"security_events.json ({len(security_events)}), "
        f"ai_recommendations.json ({len(recommendations)}), "
        f"audit_log.json ({len(audit_log)})"
    )


if __name__ == "__main__":
    main()
