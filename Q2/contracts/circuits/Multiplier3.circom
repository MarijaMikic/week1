pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals
/*This circuit template checks that c is the multiplication of a and b.*/  

template Multiplier2 () {  

   // Declaration of signals.  
   signal input in1;  
   signal input in2;  
   signal output out;  

   // Constraints.  
   out <== in1 * in2;  
}

template Multiplier3 () {  
//Declaration of signals and components.
   signal input in1;
   signal input in2;
   signal input in3;
   signal output out;
   component mult1 = Multiplier2();
   component mult2 = Multiplier2();

   //Statements.
   mult1.in1 <== in1;
   mult1.in2 <== in2;
   mult2.in1 <== mult1.out;
   mult2.in2 <== in3;
   out <== mult2.out;

   // For changing
   // Declaration of signals.  
   //signal input a;  
   //signal input b;
   //signal input c;
   //signal output d;  

   // Constraints.  
   //d <== a * b * c;  
}

component main = Multiplier3();