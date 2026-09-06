import json
from paladin.context.engine import ContextEngine
from paladin.context.history import ActionHistory
from paladin.schemas.action import AgentAction

engine = ContextEngine(action_history=ActionHistory())

# ── Action 1: Kiro lists the project directory ──────────────────
ctx1 = engine.build_context(
    AgentAction(
        action_id="req-001",
        agent="kiro",
        action_type="file_read",
        target="/home/user/project/src/main.py",
        cwd="/home/user/project",
        os="linux",
        shell="bash",
        parent_process="kiro-cli",
        agent_pid=1234,
        user="jaskaran",
        project_root="/home/user/project",
        metadata={},
    )
)

print("=== ACTION 1: Reading a normal project file ===")
print(f"  sensitivity      : {ctx1.sensitivity}")
print(f"  target_category  : {ctx1.target_category}")
print(f"  is_outside_project: {ctx1.is_outside_project}")
print(f"  recent_actions   : {ctx1.recent_actions}")
print()

# ── Action 2: Kiro explores the .ssh directory ──────────────────
ctx2 = engine.build_context(
    AgentAction(
        action_id="req-002",
        agent="kiro",
        action_type="file_read",
        target="/home/user/.ssh",
        cwd="/home/user/project",
        os="linux",
        shell="bash",
        parent_process="kiro-cli",
        agent_pid=1234,
        user="jaskaran",
        project_root="/home/user/project",
        metadata={},
    )
)

print("=== ACTION 2: Exploring .ssh directory ===")
print(f"  sensitivity      : {ctx2.sensitivity}")
print(f"  target_category  : {ctx2.target_category}")
print(f"  is_outside_project: {ctx2.is_outside_project}")
print(f"  recent_actions   : {len(ctx2.recent_actions)} action(s) before this")
print()

# ── Action 3: Kiro reads the SSH private key ────────────────────
ctx3 = engine.build_context(
    AgentAction(
        action_id="req-003",
        agent="kiro",
        action_type="file_read",
        target="/home/user/.ssh/id_rsa",
        cwd="/home/user/project",
        os="linux",
        shell="bash",
        parent_process="kiro-cli",
        agent_pid=1234,
        user="jaskaran",
        project_root="/home/user/project",
        metadata={},
    )
)

print("=== ACTION 3: Reading SSH private key ===")
print(f"  sensitivity      : {ctx3.sensitivity}")
print(f"  target_category  : {ctx3.target_category}")
print(f"  is_outside_project: {ctx3.is_outside_project}")
print(f"  recent_actions   : {len(ctx3.recent_actions)} action(s) before this")
print()
print("Full context for Action 3:")
print(json.dumps(ctx3.to_dict(), indent=2))