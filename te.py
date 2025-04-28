import subprocess
import shlex
import logging
import platform
from typing import Dict, Union, Optional, Any

# Check if the current OS is Windows
def is_windows():
    return platform.system().lower() == 'windows'

def execute_command_and_return_output(
    command: str,
    shell: bool = False,
    timeout: Optional[int] = None,
    working_dir: Optional[str] = None,
    env: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Execute a command in the terminal and return the output.
    
    Parameters:
        command (str): The command to execute
        shell (bool): Whether to use shell for execution (default: False)
        timeout (int, optional): Maximum time to wait for command execution (seconds)
        working_dir (str, optional): Working directory when executing the command
        env (dict, optional): Environment variables for the process
        
    Returns:
        dict: Dictionary containing the following information:
            - stdout (str): Standard output
            - stderr (str): Standard error output
            - return_code (int): Return code
            - error (str, optional): Error message if any
    """
    logger = logging.getLogger(__name__)
    logger.info(f"Executing command: {command}")
    
    result = {
        "stdout": "",
        "stderr": "",
        "return_code": 0
    }
    
    try:
        # Prepare command: if not using shell and command is string, split into list
        cmd = command
        if not shell and isinstance(command, str):
            cmd = shlex.split(command)
        
        # Execute command and get results
        process = subprocess.run(
            cmd,
            shell=shell,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=working_dir,
            env=env
        )
        
        # Store results
        result["stdout"] = process.stdout
        result["stderr"] = process.stderr
        result["return_code"] = process.returncode
        
        # Log results
        logger.debug(f"Command executed with return code: {process.returncode}")
        if process.returncode != 0:
            logger.warning(f"Command failed with stderr: {process.stderr}")
        
    except subprocess.TimeoutExpired as e:
        error_msg = f"Command timed out after {timeout} seconds"
        logger.error(error_msg)
        result["stdout"] = e.stdout.decode('utf-8') if e.stdout else ""
        result["stderr"] = e.stderr.decode('utf-8') if e.stderr else ""
        result["return_code"] = -1
        result["error"] = error_msg
        
    except Exception as e:
        error_msg = f"Error executing command: {str(e)}"
        logger.error(error_msg)
        result["stderr"] = str(e)
        result["return_code"] = -1
        result["error"] = error_msg
    
    return result

# Example 1: Simple command
result = execute_command_and_return_output("ifconfig", shell=True)
print(f"Output: {result['stdout']}")
print(f"Return code: {result['return_code']}")