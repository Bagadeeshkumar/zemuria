/*
Easy problem 2:

 Valid Parentheses

Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:

Open brackets must be closed by the same type of brackets.
Open brackets must be closed in the correct order.
Every close bracket has a corresponding open bracket of the same type.


Example 1:

Input: s = "()"

Output: true

Example 2:

Input: s = "()[]{}"

Output: true

Example 3:
Input: s = "(]"


Output: false

Example 4:

Input: s = "([])"

Output: true

 */

import java.util.Stack;

public class ValidParanthesis {
    public static void main(String[] args) {

        boolean t1= checkValidParanthesis("()");
        boolean t2 = checkValidParanthesis("()[]{}");
        boolean t3 = checkValidParanthesis("(]");
        boolean t4 = checkValidParanthesis("([])");

        System.out.println("testcase1 "+t1);
        System.out.println("testcase2 "+t2);
        System.out.println("testcase3 "+t3);
        System.out.println("testcase3 "+t4);
    }

    public static boolean checkValidParanthesis(String s) {
        Stack<Character> stk  =  new Stack<Character>();

        for(char c : s.toCharArray()) {

            if(c == '(' || c == '{' || c == '[') {
                stk.push(c);
            }

            if(c == ')' || c == '}' || c == ']') {
                char ch = stk.pop();
                if(c==')' && ch!='(' || c=='}' && ch!='{' || c==']' && ch!='[') {
                    return false;
                }
            }
        }

        return stk.isEmpty();
    }

}
