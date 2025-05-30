/*
Easy problem 1: Valid Anagram
Given two strings s and t, return true if t is an anagram of s, and false otherwise.

Example 1:

Input: s = "anagram", t = "nagaram"

Output: true

Example 2:

Input: s = "rat", t = "car"

Output: false



Constraints:

1 <= s.length, t.length <= 5 * 104
s and t consist of lowercase English letter
 */

import java.util.HashMap;

public class ValidAnagram {
    public static void main(String[] args) {

        boolean t3 = checkValidAnagram("anagram", "nagaram");
        boolean t2 = checkValidAnagram("rat", "car");
        boolean t1= checkValidAnagram("drama", "ram");

        System.out.println("testcase1 "+t1);
        System.out.println("testcase2 "+t2);
        System.out.println("testcase3 "+t3);
    }

    public static boolean checkValidAnagram(String s1, String s2) {
        int m = s1.length();
        int n = s2.length();
        int[] ch1= new int[26];
        int[] ch2= new int[26];

        for(int i=0;i<m;i++) {
            ch1[s1.charAt(i)-'a']++;
        }

        for(int i=0;i<n;i++) {
            ch2[s2.charAt(i)-'a']++;
        }

        for(int i=0;i<26;i++) {
            if(ch1[i]<ch2[i]) {
                return false;
            }
        }

        return true;
    }
}
