export const solutions = {
  1: {
    // Two Sum
    javascript: `
// Time Complexity: O(n)
// Space Complexity: O(n)
function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
};`,
    python: `
# Time Complexity: O(n)
# Space Complexity: O(n)
def two_sum(nums, target):
    num_dict = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in num_dict:
            return [num_dict[complement], i]
            
        num_dict[num] = i
    
    return []`,
    cpp: `
// Time Complexity: O(n)
// Space Complexity: O(n)
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> num_map;
    
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        
        if (num_map.count(complement)) {
            return {num_map[complement], i};
        }
        
        num_map[nums[i]] = i;
    }
    
    return {};
}`,
    java: `
// Time Complexity: O(n)
// Space Complexity: O(n)
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> numMap = new HashMap<>();
    
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        
        if (numMap.containsKey(complement)) {
            return new int[] {numMap.get(complement), i};
        }
        
        numMap.put(nums[i], i);
    }
    
    return new int[0];
}`,
  },
  2: {
    // Add Two Numbers
    javascript: `
// Time Complexity: O(max(m,n))
// Space Complexity: O(max(m,n))
function addTwoNumbers(l1, l2) {
  const dummy = new ListNode(0);
  let current = dummy;
  let carry = 0;
  
  while (l1 !== null || l2 !== null) {
    const x = l1 !== null ? l1.val : 0;
    const y = l2 !== null ? l2.val : 0;
    
    const sum = x + y + carry;
    carry = Math.floor(sum / 10);
    
    current.next = new ListNode(sum % 10);
    current = current.next;
    
    if (l1 !== null) l1 = l1.next;
    if (l2 !== null) l2 = l2.next;
  }
  
  if (carry > 0) {
    current.next = new ListNode(carry);
  }
  
  return dummy.next;
}`,
    python: `
# Time Complexity: O(max(m,n))
# Space Complexity: O(max(m,n))
def add_two_numbers(l1, l2):
    dummy = ListNode(0)
    current = dummy
    carry = 0
    
    while l1 or l2:
        x = l1.val if l1 else 0
        y = l2.val if l2 else 0
        
        total = x + y + carry
        carry = total // 10
        
        current.next = ListNode(total % 10)
        current = current.next
        
        if l1:
            l1 = l1.next
        if l2:
            l2 = l2.next
    
    if carry > 0:
        current.next = ListNode(carry)
    
    return dummy.next`,
    cpp: `
// Time Complexity: O(max(m,n))
// Space Complexity: O(max(m,n))
ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    ListNode* dummy = new ListNode(0);
    ListNode* current = dummy;
    int carry = 0;
    
    while (l1 != nullptr || l2 != nullptr) {
        int x = l1 ? l1->val : 0;
        int y = l2 ? l2->val : 0;
        
        int sum = x + y + carry;
        carry = sum / 10;
        
        current->next = new ListNode(sum % 10);
        current = current->next;
        
        if (l1) l1 = l1->next;
        if (l2) l2 = l2->next;
    }
    
    if (carry > 0) {
        current->next = new ListNode(carry);
    }
    
    return dummy->next;
}`,
    java: `
// Time Complexity: O(max(m,n))
// Space Complexity: O(max(m,n))
public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode current = dummy;
    int carry = 0;
    
    while (l1 != null || l2 != null) {
        int x = (l1 != null) ? l1.val : 0;
        int y = (l2 != null) ? l2.val : 0;
        
        int sum = x + y + carry;
        carry = sum / 10;
        
        current.next = new ListNode(sum % 10);
        current = current.next;
        
        if (l1 != null) l1 = l1.next;
        if (l2 != null) l2 = l2.next;
    }
    
    if (carry > 0) {
        current.next = new ListNode(carry);
    }
    
    return dummy.next;
}`,
  },
  3: {
    // Longest Substring Without Repeating Characters
    javascript: `
// Time Complexity: O(n)
// Space Complexity: O(min(m,n)) where m is the size of the charset
function lengthOfLongestSubstring(s) {
    const charMap = new Map();
    let maxLength = 0;
    let start = 0;
    
    for (let end = 0; end < s.length; end++) {
        const currentChar = s[end];
        
        // If we've seen this character before and it's in our current window
        if (charMap.has(currentChar) && charMap.get(currentChar) >= start) {
            // Move start pointer to position after the last occurrence of currentChar
            start = charMap.get(currentChar) + 1;
        }
        
        // Update max length
        maxLength = Math.max(maxLength, end - start + 1);
        
        // Store the position of currentChar
        charMap.set(currentChar, end);
    }
    
    return maxLength;
}`,
    python: `
# Time Complexity: O(n)
# Space Complexity: O(min(m,n)) where m is the size of the charset
def length_of_longest_substring(s: str) -> int:
    char_dict = {}
    max_length = 0
    start = 0
    
    for end, char in enumerate(s):
        # If we've seen this character before and it's in our current window
        if char in char_dict and char_dict[char] >= start:
            # Move start pointer to position after the last occurrence of char
            start = char_dict[char] + 1
        
        # Update max length
        max_length = max(max_length, end - start + 1)
        
        # Store the position of char
        char_dict[char] = end
    
    return max_length`,
    cpp: `
// Time Complexity: O(n)
// Space Complexity: O(min(m,n)) where m is the size of the charset
int lengthOfLongestSubstring(string s) {
    unordered_map<char, int> char_map;
    int max_length = 0;
    int start = 0;
    
    for (int end = 0; end < s.size(); end++) {
        char current_char = s[end];
        
        // If we've seen this character before and it's in our current window
        if (char_map.count(current_char) && char_map[current_char] >= start) {
            // Move start pointer to position after the last occurrence of current_char
            start = char_map[current_char] + 1;
        }
        
        // Update max length
        max_length = max(max_length, end - start + 1);
        
        // Store the position of current_char
        char_map[current_char] = end;
    }
    
    return max_length;
}`,
    java: `
// Time Complexity: O(n)
// Space Complexity: O(min(m,n)) where m is the size of the charset
public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> charMap = new HashMap<>();
    int maxLength = 0;
    int start = 0;
    
    for (int end = 0; end < s.length(); end++) {
        char currentChar = s.charAt(end);
        
        // If we've seen this character before and it's in our current window
        if (charMap.containsKey(currentChar) && charMap.get(currentChar) >= start) {
            // Move start pointer to position after the last occurrence of currentChar
            start = charMap.get(currentChar) + 1;
        }
        
        // Update max length
        maxLength = Math.max(maxLength, end - start + 1);
        
        // Store the position of currentChar
        charMap.put(currentChar, end);
    }
    
    return maxLength;
}`,
  },
  4: {
    // Median of Two Sorted Arrays
    javascript: `
// Time Complexity: O(log(min(m,n)))
// Space Complexity: O(1)
function findMedianSortedArrays(nums1, nums2) {
    // Ensure nums1 is the smaller array for simplicity
    if (nums1.length > nums2.length) {
        [nums1, nums2] = [nums2, nums1];
    }
    
    const x = nums1.length;
    const y = nums2.length;
    const totalLength = x + y;
    
    let low = 0;
    let high = x;
    
    while (low <= high) {
        // Partition the arrays
        const partitionX = Math.floor((low + high) / 2);
        const partitionY = Math.floor((totalLength + 1) / 2) - partitionX;
        
        // Get the four boundary elements
        const maxX = partitionX === 0 ? Number.NEGATIVE_INFINITY : nums1[partitionX - 1];
        const minX = partitionX === x ? Number.POSITIVE_INFINITY : nums1[partitionX];
        
        const maxY = partitionY === 0 ? Number.NEGATIVE_INFINITY : nums2[partitionY - 1];
        const minY = partitionY === y ? Number.POSITIVE_INFINITY : nums2[partitionY];
        
        // Check if we found the correct partition
        if (maxX <= minY && maxY <= minX) {
            // If the total length is odd
            if (totalLength % 2 === 1) {
                return Math.max(maxX, maxY);
            }
            // If the total length is even
            return (Math.max(maxX, maxY) + Math.min(minX, minY)) / 2;
        } else if (maxX > minY) {
            // We need to move toward the left in nums1
            high = partitionX - 1;
        } else {
            // We need to move toward the right in nums1
            low = partitionX + 1;
        }
    }
    
    // If we reach here, the input arrays were not sorted
    throw new Error("Input arrays are not sorted");
}`,
    python: `
# Time Complexity: O(log(min(m,n)))
# Space Complexity: O(1)
def find_median_sorted_arrays(nums1, nums2):
    # Ensure nums1 is the smaller array for simplicity
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    
    x, y = len(nums1), len(nums2)
    total_length = x + y
    
    low, high = 0, x
    
    while low <= high:
        # Partition the arrays
        partition_x = (low + high) // 2
        partition_y = (total_length + 1) // 2 - partition_x
        
        # Get the four boundary elements
        max_x = float('-inf') if partition_x == 0 else nums1[partition_x - 1]
        min_x = float('inf') if partition_x == x else nums1[partition_x]
        
        max_y = float('-inf') if partition_y == 0 else nums2[partition_y - 1]
        min_y = float('inf') if partition_y == y else nums2[partition_y]
        
        # Check if we found the correct partition
        if max_x <= min_y and max_y <= min_x:
            # If the total length is odd
            if total_length % 2 == 1:
                return max(max_x, max_y)
            # If the total length is even
            return (max(max_x, max_y) + min(min_x, min_y)) / 2
        elif max_x > min_y:
            # We need to move toward the left in nums1
            high = partition_x - 1
        else:
            # We need to move toward the right in nums1
            low = partition_x + 1
    
    # If we reach here, the input arrays were not sorted
    raise ValueError("Input arrays are not sorted")`,
    cpp: `
// Time Complexity: O(log(min(m,n)))
// Space Complexity: O(1)
double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    // Ensure nums1 is the smaller array for simplicity
    if (nums1.size() > nums2.size()) {
        swap(nums1, nums2);
    }
    
    int x = nums1.size();
    int y = nums2.size();
    int totalLength = x + y;
    
    int low = 0;
    int high = x;
    
    while (low <= high) {
        // Partition the arrays
        int partitionX = (low + high) / 2;
        int partitionY = (totalLength + 1) / 2 - partitionX;
        
        // Get the four boundary elements
        double maxX = (partitionX == 0) ? INT_MIN : nums1[partitionX - 1];
        double minX = (partitionX == x) ? INT_MAX : nums1[partitionX];
        
        double maxY = (partitionY == 0) ? INT_MIN : nums2[partitionY - 1];
        double minY = (partitionY == y) ? INT_MAX : nums2[partitionY];
        
        // Check if we found the correct partition
        if (maxX <= minY && maxY <= minX) {
            // If the total length is odd
            if (totalLength % 2 == 1) {
                return max(maxX, maxY);
            }
            // If the total length is even
            return (max(maxX, maxY) + min(minX, minY)) / 2.0;
        } else if (maxX > minY) {
            // We need to move toward the left in nums1
            high = partitionX - 1;
        } else {
            // We need to move toward the right in nums1
            low = partitionX + 1;
        }
    }
    
    // If we reach here, the input arrays were not sorted
    throw invalid_argument("Input arrays are not sorted");
}`,
    java: `
// Time Complexity: O(log(min(m,n)))
// Space Complexity: O(1)
public double findMedianSortedArrays(int[] nums1, int[] nums2) {
    // Ensure nums1 is the smaller array for simplicity
    if (nums1.length > nums2.length) {
        int[] temp = nums1;
        nums1 = nums2;
        nums2 = temp;
    }
    
    int x = nums1.length;
    int y = nums2.length;
    int totalLength = x + y;
    
    int low = 0;
    int high = x;
    
    while (low <= high) {
        // Partition the arrays
        int partitionX = (low + high) / 2;
        int partitionY = (totalLength + 1) / 2 - partitionX;
        
        // Get the four boundary elements
        double maxX = (partitionX == 0) ? Integer.MIN_VALUE : nums1[partitionX - 1];
        double minX = (partitionX == x) ? Integer.MAX_VALUE : nums1[partitionX];
        
        double maxY = (partitionY == 0) ? Integer.MIN_VALUE : nums2[partitionY - 1];
        double minY = (partitionY == y) ? Integer.MAX_VALUE : nums2[partitionY];
        
        // Check if we found the correct partition
        if (maxX <= minY && maxY <= minX) {
            // If the total length is odd
            if (totalLength % 2 == 1) {
                return Math.max(maxX, maxY);
            }
            // If the total length is even
            return (Math.max(maxX, maxY) + Math.min(minX, minY)) / 2.0;
        } else if (maxX > minY) {
            // We need to move toward the left in nums1
            high = partitionX - 1;
        } else {
            // We need to move toward the right in nums1
            low = partitionX + 1;
        }
    }
    
    // If we reach here, the input arrays were not sorted
    throw new IllegalArgumentException("Input arrays are not sorted");
}`,
  },
  5: {
    // Palindrome Number
    javascript: `
// Time Complexity: O(log(x)) - we're processing each digit in the number
// Space Complexity: O(1) - we use only a constant amount of space
function isPalindrome(x) {
    // Negative numbers are not palindromes due to the minus sign
    if (x < 0) return false;
    
    // Single digits are always palindromes
    if (x < 10) return true;
    
    // Numbers ending with 0 are only palindromes if they are 0 itself
    if (x % 10 === 0 && x !== 0) return false;
    
    let reversed = 0;
    
    // Reverse the second half of the number
    while (x > reversed) {
        reversed = reversed * 10 + (x % 10);
        x = Math.floor(x / 10);
    }
    
    // For even number of digits: x === reversed
    // For odd number of digits: x === Math.floor(reversed / 10)
    return x === reversed || x === Math.floor(reversed / 10);
}`,
    python: `
# Time Complexity: O(log(x)) - we're processing each digit in the number
# Space Complexity: O(1) - we use only a constant amount of space
def is_palindrome(x: int) -> bool:
    # Negative numbers are not palindromes due to the minus sign
    if x < 0:
        return False
    
    # Single digits are always palindromes
    if x < 10:
        return True
    
    # Numbers ending with 0 are only palindromes if they are 0 itself
    if x % 10 == 0 and x != 0:
        return False
    
    reversed_num = 0
    
    # Reverse the second half of the number
    while x > reversed_num:
        reversed_num = reversed_num * 10 + (x % 10)
        x //= 10
    
    # For even number of digits: x == reversed_num
    # For odd number of digits: x == reversed_num // 10
    return x == reversed_num or x == reversed_num // 10`,
    cpp: `
// Time Complexity: O(log(x)) - we're processing each digit in the number
// Space Complexity: O(1) - we use only a constant amount of space
bool isPalindrome(int x) {
    // Negative numbers are not palindromes due to the minus sign
    if (x < 0) return false;
    
    // Single digits are always palindromes
    if (x < 10) return true;
    
    // Numbers ending with 0 are only palindromes if they are 0 itself
    if (x % 10 == 0 && x != 0) return false;
    
    int reversed = 0;
    
    // Reverse the second half of the number
    while (x > reversed) {
        reversed = reversed * 10 + (x % 10);
        x /= 10;
    }
    
    // For even number of digits: x == reversed
    // For odd number of digits: x == reversed / 10
    return x == reversed || x == reversed / 10;
}`,
    java: `
// Time Complexity: O(log(x)) - we're processing each digit in the number
// Space Complexity: O(1) - we use only a constant amount of space
public boolean isPalindrome(int x) {
    // Negative numbers are not palindromes due to the minus sign
    if (x < 0) return false;
    
    // Single digits are always palindromes
    if (x < 10) return true;
    
    // Numbers ending with 0 are only palindromes if they are 0 itself
    if (x % 10 == 0 && x != 0) return false;
    
    int reversed = 0;
    
    // Reverse the second half of the number
    while (x > reversed) {
        reversed = reversed * 10 + (x % 10);
        x /= 10;
    }
    
    // For even number of digits: x == reversed
    // For odd number of digits: x == reversed / 10
    return x == reversed || x == reversed / 10;
}`,
  },
};
